import React from "react";
import { ExternalLink } from "lucide-react";
import xIcon from "../../assets/icons8-x-24 (1).png";

const canDoItems = [
  "Stay connected to your account until you revoke access.",
  "Upload media like photos and videos for you.",
  "Block and unblock accounts for you.",
];

const canViewItems = [
  "Posts you’ve liked and likes you can view.",
  "All of the posts you can view, including posts from protected accounts.",
  "Accounts you’ve muted.",
];

const InfoList = ({ title, items, moreLabel }) => (
  <div className="space-y-4">
    <p className="text-lg font-semibold text-[#0f1419]">{title}</p>
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-[15px] leading-snug text-[#0f1419]"
        >
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#0f1419]/80" />
          <span className="flex-1">{item}</span>
        </li>
      ))}
    </ul>
    <button
      type="button"
      className="text-sm font-semibold text-[#1d9bf0] hover:underline"
    >
      {moreLabel}
    </button>
  </div>
);

const AuthorizePage = ({ onLoginSuccess, onCancel }) => {
  const handleAuthorize = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] text-[#0f1419]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10">
        <div className="w-full rounded-[32px] border border-black/5 bg-white shadow-[0_45px_120px_rgba(15,20,25,0.15)]">
          <div className="flex flex-col gap-8 p-6 sm:p-10">
            <div className="flex items-center justify-between text-sm text-[#536471]">
              <div className="flex items-center gap-3">
                <img src={xIcon} alt="X" className="h-8 w-8" />
                <span>OAuth • Secure connection</span>
              </div>
              <span>app.tweethunter.io</span>
            </div>

            <div className="space-y-6">
              <p className="text-3xl font-bold leading-tight sm:text-[34px]">
                Tweet Hunter Pro wants to access your X account.
              </p>

              <div className="flex flex-col gap-4 rounded-3xl border border-black/5 bg-[#f7f9f9] p-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold text-white"
                    style={{
                      background: "linear-gradient(135deg, #1d9bf0, #004c86)",
                    }}
                  >
                    TH
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Tweet Hunter Pro</p>
                    <p className="text-sm text-[#536471]">@ourfavaddict07</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm font-semibold text-[#1d9bf0] hover:underline"
                >
                  View app
                  <ExternalLink size={16} strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleAuthorize}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#0f1419] px-6 py-4 text-base font-semibold text-white shadow-[0_20px_60px_rgba(15,20,25,0.25)] transition hover:-translate-y-0.5 hover:bg-black sm:w-auto"
              >
                Authorize app
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full text-base font-semibold text-[#f4212e] hover:text-[#b70d1a] sm:w-auto"
              >
                Cancel
              </button>
            </div>

            <div className="border-t border-[#e1e8ed]" />

            <div className="space-y-8">
              <p className="text-base text-[#536471]">
                Find inspiration from the best and become a Tweet Machine.
              </p>

              <InfoList
                title="Things this App can do..."
                items={canDoItems}
                moreLabel="8 more"
              />

              <InfoList
                title="Things this App can view..."
                items={canViewItems}
                moreLabel="7 more"
              />
            </div>

            <div className="border-t border-[#e1e8ed]" />

            <div className="space-y-3 text-sm text-[#536471]">
              <p>
                Made by{" "}
                <a
                  href="https://lempire.co/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#1d9bf0] hover:underline"
                >
                  lempire
                </a>
                . Read lempire’s{" "}
                <a
                  href="https://tweethunter.io/privacy-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#1d9bf0] hover:underline"
                >
                  privacy policy
                </a>{" "}
                and{" "}
                <a
                  href="https://tweethunter.io/terms-of-use"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#1d9bf0] hover:underline"
                >
                  terms
                </a>
                .
              </p>
              <p className="text-xs">
                By authorizing Tweet Hunter Pro, you agree to X’s{" "}
                <a
                  href="https://x.com/en/tos"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#1d9bf0] hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="https://x.com/en/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#1d9bf0] hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorizePage;
