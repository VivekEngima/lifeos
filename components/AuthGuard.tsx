"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  lockApp: () => void;
  unlockApp: (pin: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  lockApp: () => {},
  unlockApp: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const MASTER_PIN = "963963";
const AUTH_STORAGE_KEY = "lifeos_pin_authenticated_v1";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check saved session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored === "true") {
        setIsAuthenticated(true);
      }
    } catch {
      // Fallback
    } finally {
      setMounted(true);
    }
  }, []);

  // When mounted and locked, auto-focus the first input field immediately
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [mounted, isAuthenticated]);

  const handleVerify = useCallback((enteredPin: string) => {
    if (enteredPin === MASTER_PIN) {
      setIsSuccess(true);
      setErrorMsg("");
      setTimeout(() => {
        setIsAuthenticated(true);
        setIsSuccess(false);
        setPinDigits(["", "", "", "", "", ""]);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, "true");
        } catch {
          // ignore
        }
      }, 400);
      return true;
    } else {
      setIsShaking(true);
      setErrorMsg("Invalid PIN. Access Denied.");
      setTimeout(() => {
        setIsShaking(false);
        setPinDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }, 550);
      return false;
    }
  }, []);

  const lockApp = useCallback(() => {
    setIsAuthenticated(false);
    setPinDigits(["", "", "", "", "", ""]);
    setErrorMsg("");
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const unlockApp = useCallback(
    (pin: string) => {
      return handleVerify(pin);
    },
    [handleVerify]
  );

  const handleChange = (index: number, value: string) => {
    if (isSuccess) return;
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      const newPin = [...pinDigits];
      newPin[index] = "";
      setPinDigits(newPin);
      return;
    }

    const digit = digits.slice(-1);
    const newPin = [...pinDigits];
    newPin[index] = digit;
    setPinDigits(newPin);
    setErrorMsg("");

    // Move focus forward to next slot
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify when 6 digits are complete
    const fullPin = newPin.join("");
    if (fullPin.length === 6 && !newPin.includes("")) {
      handleVerify(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSuccess) return;

    // Handle Numpad and regular keys
    if (e.key === "Backspace") {
      if (!pinDigits[index] && index > 0) {
        // Move back and clear previous
        const newPin = [...pinDigits];
        newPin[index - 1] = "";
        setPinDigits(newPin);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newPin = [...pinDigits];
        newPin[index] = "";
        setPinDigits(newPin);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      const fullPin = pinDigits.join("");
      if (fullPin.length === 6) {
        handleVerify(fullPin);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isSuccess) return;

    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newPin = [...pinDigits];
    for (let i = 0; i < pasted.length; i++) {
      newPin[i] = pasted[i];
    }
    setPinDigits(newPin);
    setErrorMsg("");

    const nextFocusIdx = Math.min(pasted.length, 5);
    inputRefs.current[nextFocusIdx]?.focus();

    if (pasted.length === 6) {
      handleVerify(pasted);
    }
  };

  // Initial loading splash before hydration check
  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-[#090D14] flex flex-col items-center justify-center z-50">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <span className="material-symbols-outlined text-[24px]">lock</span>
        </div>
      </div>
    );
  }

  // If authenticated, render full application
  if (isAuthenticated) {
    return (
      <AuthContext.Provider value={{ isAuthenticated, lockApp, unlockApp }}>
        {children}
      </AuthContext.Provider>
    );
  }

  const fullPinString = pinDigits.join("");

  // Compact, sleek PIN security modal
  return (
    <AuthContext.Provider value={{ isAuthenticated, lockApp, unlockApp }}>
      <div className="fixed inset-0 z-50 bg-[#080B10]/95 backdrop-blur-md flex items-center justify-center p-4 selection:bg-amber-500/30">
        <div
          className={`w-full max-w-sm rounded-2xl bg-surface-container-low border border-amber-500/30 shadow-[0_0_40px_rgba(0,0,0,0.8)] p-6 sm:p-7 relative transition-transform duration-200 ${
            isShaking ? "animate-shake" : ""
          }`}
        >
          {/* Top Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 mb-3 ${
                isSuccess
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  : isShaking
                  ? "bg-red-500/20 border-red-400 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {isSuccess ? "lock_open" : isShaking ? "gpp_bad" : "lock"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container border border-outline-variant/60 text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              LifeOS Security Gateway
            </div>

            <h1 className="text-lg font-bold text-on-surface tracking-tight">
              {isSuccess ? "Vault Decrypted" : "Enter Security PIN"}
            </h1>
            <p className="text-xs text-on-surface-variant font-mono mt-0.5">
              {isSuccess ? "Access granted. Launching workspace..." : "Type 6-digit PIN on numpad or keyboard"}
            </p>
          </div>

          {/* 6 Compact Input Fields (First input auto-focused on load) */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-5">
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const hasVal = Boolean(pinDigits[idx]);
              return (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  autoComplete="one-time-code"
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  disabled={isSuccess}
                  value={pinDigits[idx]}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  style={{
                    backgroundColor: isSuccess
                      ? "rgba(16, 185, 129, 0.2)"
                      : isShaking
                      ? "rgba(239, 68, 68, 0.15)"
                      : hasVal
                      ? "rgba(245, 158, 11, 0.12)"
                      : "#1f1f22",
                    color: "#fde68a",
                    caretColor: "#f59e0b",
                  }}
                  className={`pin-input-box w-10 sm:w-11 h-12 rounded-xl text-center text-xl font-mono font-bold transition-all outline-none border-2 select-none ${
                    isSuccess
                      ? "border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      : isShaking
                      ? "border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                      : hasVal
                      ? "border-amber-400/90 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                      : "border-outline-variant/60 focus:border-amber-400 text-amber-200 focus:shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                  }`}
                />
              );
            })}
          </div>

          {/* Status / Error message */}
          <div className="h-5 flex items-center justify-center text-center mb-4">
            {errorMsg && (
              <span className="text-xs font-mono font-semibold text-red-400 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {errorMsg}
              </span>
            )}
            {isSuccess && (
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                UNLOCKED • ACCESS GRANTED
              </span>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSuccess || fullPinString.length < 6}
              onClick={() => handleVerify(fullPinString)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">lock_open</span>
              <span>Unlock Vault</span>
            </button>

            {fullPinString.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setPinDigits(["", "", "", "", "", ""]);
                  setErrorMsg("");
                  inputRefs.current[0]?.focus();
                }}
                className="px-3 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-on-surface font-mono text-xs transition-colors cursor-pointer"
                title="Clear input"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </AuthContext.Provider>
  );
}
