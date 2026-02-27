'use server';

import { cookies } from 'next/headers';
import { createAuthenticatedAction } from '@/lib/auth/action-wrapper';
import { createProviderProfileRepository } from '@/lib/repositories/provider-profile.repo';
import { createStripeService } from '@/lib/services/stripe';
import {
  connectStripeAccountSchema,
  createOnboardingLinkSchema,
  type ConnectStripeAccountData,
  type CreateOnboardingLinkData,
} from '@/lib/validations/payment';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';
import { env } from '@/lib/config/env';

type StripeAccountStatusData = {
  hasAccount: boolean;
  accountId: string | null;
  status: 'PENDING' | 'ACTIVE' | 'RESTRICTED' | null;
  detailsSubmitted: boolean;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  requirements?: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
  };
};

/**
 * Initiate Stripe Connect onboarding for a provider
 * Creates a Stripe Express account and returns an onboarding URL
 */
export const connectStripeAccount = createAuthenticatedAction(
  connectStripeAccountSchema,
  async (data: ConnectStripeAccountData, user) => {
    // Get team ID from cookie
    const cookieStore = await cookies();
    const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

    if (!teamId) {
      return {
        success: false,
        error: 'No team selected. Please complete provider onboarding first.',
      };
    }

    // Get provider profile
    const providerRepo = createProviderProfileRepository();
    const providerProfile = await providerRepo.findByTeamId(teamId);

    if (!providerProfile) {
      return {
        success: false,
        error: 'Provider profile not found. Please complete provider onboarding first.',
      };
    }

    // Check if provider already has a Stripe account
    if (providerProfile.stripeAccountId) {
      // Account exists, create a new onboarding link to continue/update
      const stripeService = createStripeService();
      const onboardingUrl = await stripeService.createAccountLink({
        accountId: providerProfile.stripeAccountId,
        returnUrl: data.returnUrl ?? `${env.NEXT_PUBLIC_PROVIDER_DASHBOARD_URL}/payments/callback`,
        refreshUrl: `${env.NEXT_PUBLIC_PROVIDER_DASHBOARD_URL}/payments?refresh=true`,
      });

      return {
        success: true,
        data: {
          accountId: providerProfile.stripeAccountId,
          onboardingUrl,
          isExisting: true,
        },
      };
    }

    // Create new Stripe Connect account
    const stripeService = createStripeService();
    const result = await stripeService.createConnectAccount({
      email: user.email,
      country: 'AU', // Australia-only for now
    });

    // Save account ID to provider profile
    await providerRepo.update(providerProfile.id, {
      stripeAccountId: result.accountId,
      stripeAccountStatus: 'PENDING',
    });

    return {
      success: true,
      data: {
        accountId: result.accountId,
        onboardingUrl: result.onboardingUrl,
        isExisting: false,
      },
    };
  }
);

/**
 * Get the current Stripe Connect account status for a provider
 */
export const getStripeAccountStatus = createAuthenticatedAction<StripeAccountStatusData>(
  async () => {
    // Get team ID from cookie
    const cookieStore = await cookies();
    const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

    if (!teamId) {
      return {
        success: false,
        error: 'No team selected. Please complete provider onboarding first.',
      };
    }

    // Get provider profile
    const providerRepo = createProviderProfileRepository();
    const providerProfile = await providerRepo.findByTeamId(teamId);

    if (!providerProfile) {
      return {
        success: false,
        error: 'Provider profile not found. Please complete provider onboarding first.',
      };
    }

    // No Stripe account yet
    if (!providerProfile.stripeAccountId) {
      return {
        success: true,
        data: {
          hasAccount: false,
          accountId: null,
          status: null,
          detailsSubmitted: false,
          payoutsEnabled: false,
          chargesEnabled: false,
        },
      };
    }

    // Get status from Stripe
    const stripeService = createStripeService();
    const accountStatus = await stripeService.getAccountStatus(providerProfile.stripeAccountId);

    // Determine the status for our enum
    let status: 'PENDING' | 'ACTIVE' | 'RESTRICTED' = 'PENDING';
    if (accountStatus.chargesEnabled && accountStatus.payoutsEnabled) {
      status = 'ACTIVE';
    } else if (accountStatus.requirements.pastDue.length > 0) {
      status = 'RESTRICTED';
    }

    // Update our stored status if it changed
    if (providerProfile.stripeAccountStatus !== status) {
      await providerRepo.update(providerProfile.id, {
        stripeAccountStatus: status,
      });
    }

    return {
      success: true,
      data: {
        hasAccount: true,
        accountId: providerProfile.stripeAccountId,
        status,
        detailsSubmitted: accountStatus.detailsSubmitted,
        payoutsEnabled: accountStatus.payoutsEnabled,
        chargesEnabled: accountStatus.chargesEnabled,
        requirements: accountStatus.requirements,
      },
    };
  }
);

/**
 * Create a new Stripe Connect onboarding link
 * Used when a provider needs to complete or update their account
 */
export const createStripeOnboardingLink = createAuthenticatedAction(
  createOnboardingLinkSchema,
  async (data: CreateOnboardingLinkData) => {
    // Get team ID from cookie
    const cookieStore = await cookies();
    const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

    if (!teamId) {
      return {
        success: false,
        error: 'No team selected. Please complete provider onboarding first.',
      };
    }

    // Get provider profile
    const providerRepo = createProviderProfileRepository();
    const providerProfile = await providerRepo.findByTeamId(teamId);

    if (!providerProfile) {
      return {
        success: false,
        error: 'Provider profile not found. Please complete provider onboarding first.',
      };
    }

    if (!providerProfile.stripeAccountId) {
      return {
        success: false,
        error: 'No Stripe account found. Please connect your Stripe account first.',
      };
    }

    // Create onboarding link
    const stripeService = createStripeService();
    const onboardingUrl = await stripeService.createAccountLink({
      accountId: providerProfile.stripeAccountId,
      returnUrl: data.returnUrl,
      refreshUrl: data.refreshUrl,
    });

    return {
      success: true,
      data: {
        onboardingUrl,
      },
    };
  }
);
