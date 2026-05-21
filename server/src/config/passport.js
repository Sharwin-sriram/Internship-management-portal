import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import env from "./env.js";

async function fetchGithubPrimaryEmail(accessToken) {
  const res = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "Internship-Portal",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch GitHub email");
  }

  const emails = await res.json();
  const primary =
    emails.find((e) => e.primary && e.verified) ||
    emails.find((e) => e.verified);
  return primary?.email || null;
}

export function configurePassport() {
  if (env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_OAUTH_CLIENT_ID,
          clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
          callbackURL: env.GOOGLE_OAUTH_CALLBACK_URL,
          passReqToCallback: true,
        },
        (req, accessToken, refreshToken, profile, done) => {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("Google account has no email"));
          }
          done(null, {
            provider: "google",
            providerId: profile.id,
            email,
            name: profile.displayName || email.split("@")[0],
            avatar: profile.photos?.[0]?.value || "",
          });
        },
      ),
    );
  }

  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          callbackURL: env.GITHUB_CALLBACK_URL,
          scope: ["user:email", "read:user"],
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            let email =
              profile.emails?.find((e) => e.verified)?.value ||
              profile.emails?.[0]?.value;

            if (!email) {
              email = await fetchGithubPrimaryEmail(accessToken);
            }

            if (!email) {
              return done(
                new Error(
                  "GitHub account has no public email. Add a verified email in GitHub settings.",
                ),
              );
            }

            done(null, {
              provider: "github",
              providerId: String(profile.id),
              email,
              name: profile.displayName || profile.username || email.split("@")[0],
              avatar: profile.photos?.[0]?.value || profile._json?.avatar_url || "",
            });
          } catch (err) {
            done(err);
          }
        },
      ),
    );
  }
}

export default passport;
