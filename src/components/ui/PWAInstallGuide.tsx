"use client";

import { useState } from "react";
import { X, Smartphone, Monitor, Download, Share, Plus } from "lucide-react";
import { isIOS, isAndroid, isStandalone } from "../../lib/pwa";

interface PWAInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PWAInstallGuide({
  isOpen,
  onClose,
}: PWAInstallGuideProps) {
  const [activeTab, setActiveTab] = useState<"mobile" | "desktop">("mobile");

  if (!isOpen) return null;

  const isIOSDevice = isIOS();
  const isAndroidDevice = isAndroid();
  const isStandaloneMode = isStandalone();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Install App
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {isStandaloneMode ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Download className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                App Already Installed
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                This app is already installed on your device.
              </p>
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                <button
                  onClick={() => setActiveTab("mobile")}
                  className={`flex flex-1 items-center justify-center space-x-2 rounded-md px-4 py-2 transition-colors ${
                    activeTab === "mobile"
                      ? "bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile</span>
                </button>
                <button
                  onClick={() => setActiveTab("desktop")}
                  className={`flex flex-1 items-center justify-center space-x-2 rounded-md px-4 py-2 transition-colors ${
                    activeTab === "desktop"
                      ? "bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                  <span>Desktop</span>
                </button>
              </div>

              {/* Mobile Instructions */}
              {activeTab === "mobile" && (
                <div className="space-y-6">
                  {isIOSDevice ? (
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Install on iPhone/iPad
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              1
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Tap the Share button
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Look for the share icon at the bottom of your
                              Safari browser
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              2
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Scroll down and tap "Add to Home Screen"
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              You'll see this option in the share menu
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              3
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Tap "Add" to confirm
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              The app will be added to your home screen
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : isAndroidDevice ? (
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Install on Android
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              1
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Look for the install banner
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Chrome will show an "Add to Home screen" banner at
                              the bottom
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              2
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Tap "Add" or "Install"
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Confirm the installation when prompted
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              3
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Access from home screen
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              The app icon will appear on your home screen
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Install on Mobile
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              1
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Open in your mobile browser
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Use Chrome, Safari, or your preferred mobile
                              browser
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              2
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Look for install option
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Browser will show an install prompt or add to home
                              screen option
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              3
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Follow browser instructions
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Complete the installation process as guided by
                              your browser
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Desktop Instructions */}
              {activeTab === "desktop" && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Install on Desktop
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          1
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Look for the install button
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Chrome, Edge, or other Chromium-based browsers will
                          show an install icon in the address bar
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          2
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Click "Install" when prompted
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          A dialog will appear asking if you want to install the
                          app
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          3
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Access from desktop or taskbar
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          The app will be available in your applications menu
                          and can be pinned to taskbar
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="mt-8 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <h4 className="mb-2 font-semibold text-green-900 dark:text-green-100">
                  Benefits of Installing
                </h4>
                <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
                  <li>• Faster loading and better performance</li>
                  <li>• Works offline for basic functionality</li>
                  <li>• Native app-like experience</li>
                  <li>• Easy access from home screen or desktop</li>
                  <li>• Push notifications support</li>
                </ul>
              </div>
            </>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            >
              {isStandaloneMode ? "Close" : "Got it"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
