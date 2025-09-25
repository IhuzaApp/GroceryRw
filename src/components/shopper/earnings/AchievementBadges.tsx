import React, { useState, useEffect } from "react";
import { Badge, Progress, Tooltip, Whisper } from "rsuite";
import { formatCurrencySync } from "../../../utils/formatCurrency";
import { authenticatedFetch } from "@lib/authenticatedFetch";
import { useTheme } from "../../../context/ThemeContext";

interface Achievement {
  type: string;
  level: string;
  badgeName: string;
  description: string;
  achieved: boolean;
  progress: number;
  target: number;
  current: number;
  streakCount?: number;
  achievedAt?: string;
}

interface AchievementData {
  achieved: Achievement[];
  pending: Achievement[];
  summary: {
    totalAchieved: number;
    totalPending: number;
    monthlyEarnings: number;
    monthlyOrderCount: number;
    monthlyRating: number;
  };
}

const AchievementBadges: React.FC = () => {
  const { theme } = useTheme();
  const [achievementData, setAchievementData] = useState<AchievementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const response = await authenticatedFetch("/api/queries/shopper-achievements");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAchievementData(data.achievements);
          }
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const getBadgeIcon = (level: string) => {
    switch (level) {
      case 'bronze':
        return (
          <svg viewBox="-3.5 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M9.73779 18.8436L12.9509 20.6987L6.42609 32.0001L4.55333 27.8234L9.73779 18.8436Z" fill="#AA75CB"></path>
              <path d="M9.73779 18.8436L6.52467 16.9885L-0.000155079 28.2899L4.55333 27.8234L9.73779 18.8436Z" fill="#73488D"></path>
              <path d="M14.3218 18.8436L11.1087 20.6987L17.6335 32.0001L19.5062 27.8234L14.3218 18.8436Z" fill="#73488D"></path>
              <path d="M14.3218 18.8436L17.5349 16.9885L24.0597 28.2899L19.5062 27.8234L14.3218 18.8436Z" fill="#AA75CB"></path>
              <circle cx="12.0246" cy="11.0622" r="11.0622" fill="#DC9E42"></circle>
              <circle cx="12.0247" cy="11.0621" r="8.63501" fill="#734C12"></circle>
              <mask id="mask0_103_1242" style={{maskType: 'alpha'}} maskUnits="userSpaceOnUse" x="3" y="3" width="19" height="18">
                <circle cx="12.4857" cy="11.984" r="8.65511" fill="#C28B37"></circle>
              </mask>
              <g mask="url(#mask0_103_1242)">
                <circle cx="12.0247" cy="11.0622" r="8.65511" fill="#A36D1D"></circle>
              </g>
              <path d="M12.0713 5.04102L13.9383 8.77508L17.6724 9.24183L15.1083 12.1171L15.8054 16.2432L12.0713 14.3762L8.33724 16.2432L9.04049 12.1171L6.47021 9.24183L10.2043 8.77508L12.0713 5.04102Z" fill="url(#paint0_linear_103_1242)"></path>
              <defs>
                <linearGradient id="paint0_linear_103_1242" x1="12.0713" y1="5.04102" x2="12.0713" y2="16.2432" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FCFF80"></stop>
                  <stop offset="0.401042" stopColor="#FDE870"></stop>
                  <stop offset="1" stopColor="#FFC759"></stop>
                </linearGradient>
              </defs>
            </g>
          </svg>
        );
      case 'silver':
        return (
          <svg viewBox="-3.5 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M9.73779 18.8436L12.9509 20.6987L6.42609 32.0001L4.55333 27.8234L9.73779 18.8436Z" fill="#418ED6"></path>
              <path d="M9.73779 18.8436L6.52467 16.9885L-0.000155079 28.2899L4.55333 27.8234L9.73779 18.8436Z" fill="#2B63A6"></path>
              <path d="M14.3218 18.8436L11.1087 20.6987L17.6335 32.0001L19.5062 27.8234L14.3218 18.8436Z" fill="#2B63A6"></path>
              <path d="M14.3218 18.8436L17.5349 16.9885L24.0597 28.2899L19.5062 27.8234L14.3218 18.8436Z" fill="#418ED6"></path>
              <circle cx="12.0246" cy="11.0622" r="11.0622" fill="#E3E3E3"></circle>
              <circle cx="12.0247" cy="11.0621" r="8.63501" fill="#595959"></circle>
              <mask id="mask0_103_1231" style={{maskType: 'alpha'}} maskUnits="userSpaceOnUse" x="3" y="3" width="19" height="18">
                <circle cx="12.4857" cy="11.984" r="8.65511" fill="#C28B37"></circle>
              </mask>
              <g mask="url(#mask0_103_1231)">
                <circle cx="12.0247" cy="11.0622" r="8.65511" fill="url(#paint0_linear_103_1231)"></circle>
              </g>
              <path d="M12.0713 5.04102L13.9383 8.77508L17.6724 9.24183L15.1083 12.1171L15.8054 16.2432L12.0713 14.3762L8.33724 16.2432L9.04049 12.1171L6.47021 9.24183L10.2043 8.77508L12.0713 5.04102Z" fill="url(#paint1_linear_103_1231)"></path>
              <defs>
                <linearGradient id="paint0_linear_103_1231" x1="12.0247" y1="2.4071" x2="12.0247" y2="19.7173" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#9CA1A3"></stop>
                  <stop offset="1" stopColor="#9CA1A3" stopOpacity="0"></stop>
                </linearGradient>
                <linearGradient id="paint1_linear_103_1231" x1="12.0713" y1="5.04102" x2="12.0713" y2="16.2432" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F1F5F5"></stop>
                  <stop offset="0.0001" stopColor="white"></stop>
                  <stop offset="1" stopColor="#F1F5F5"></stop>
                </linearGradient>
              </defs>
            </g>
          </svg>
        );
      case 'gold':
        return (
          <svg viewBox="-3.5 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M9.73795 18.8436L12.9511 20.6987L6.42625 32L4.55349 27.8233L9.73795 18.8436Z" fill="#CE4444"></path>
              <path d="M9.73795 18.8436L6.52483 16.9885L0 28.2898L4.55349 27.8233L9.73795 18.8436Z" fill="#983535"></path>
              <path d="M14.322 18.8436L11.1088 20.6987L17.6337 32L19.5064 27.8233L14.322 18.8436Z" fill="#983535"></path>
              <path d="M14.322 18.8436L17.5351 16.9885L24.0599 28.2898L19.5064 27.8233L14.322 18.8436Z" fill="#CE4444"></path>
              <path d="M22.9936 11.0622C22.9936 17.1716 18.0409 22.1243 11.9314 22.1243C5.82194 22.1243 0.869249 17.1716 0.869249 11.0622C0.869249 4.9527 5.82194 0 11.9314 0C18.0409 0 22.9936 4.9527 22.9936 11.0622Z" fill="url(#paint0_linear_103_1801)"></path>
              <path d="M20.5665 11.0621C20.5665 15.8311 16.7004 19.6972 11.9315 19.6972C7.16247 19.6972 3.29645 15.8311 3.29645 11.0621C3.29645 6.29315 7.16247 2.42713 11.9315 2.42713C16.7004 2.42713 20.5665 6.29315 20.5665 11.0621Z" fill="#A88300"></path>
              <path d="M21.0477 11.984C21.0477 16.7641 17.1727 20.6391 12.3926 20.6391C7.61251 20.6391 3.73748 16.7641 3.73748 11.984C3.73748 7.20389 7.61251 3.32887 12.3926 3.32887C17.1727 3.32887 21.0477 7.20389 21.0477 11.984Z" fill="#C28B37"></path>
              <path d="M20.5868 11.0621C20.5868 15.8422 16.7118 19.7172 11.9317 19.7172C7.15159 19.7172 3.27656 15.8422 3.27656 11.0621C3.27656 6.28205 7.15159 2.40702 11.9317 2.40702C16.7004 2.40702 20.5868 6.28205 20.5868 11.0621Z" fill="#C09525"></path>
              <path d="M11.9781 5.04096L13.8451 8.77502L17.5792 9.24178L15.0151 12.117L15.7122 16.2431L11.9781 14.3761L8.24404 16.2431L8.94729 12.117L6.37701 9.24178L10.1111 8.77502L11.9781 5.04096Z" fill="url(#paint1_linear_103_1801)"></path>
              <defs>
                <linearGradient id="paint0_linear_103_1801" x1="11.1804" y1="4.03192" x2="12.6813" y2="31.965" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFC600"></stop>
                  <stop offset="1" stopColor="#FFDE69"></stop>
                </linearGradient>
                <linearGradient id="paint1_linear_103_1801" x1="11.9783" y1="5.04096" x2="11.9783" y2="16.2431" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFCDD"></stop>
                  <stop offset="1" stopColor="#FFE896"></stop>
                </linearGradient>
              </defs>
            </g>
          </svg>
        );
      case 'platinum':
        return (
          <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <polygon style={{fill: '#E68900'}} points="394.827,348.588 327.842,345.626 335.247,418.117 376.558,463.238 443.254,465.502"></polygon>
              <polygon style={{fill: '#FFAD00'}} points="285.067,401.113 330.999,512 376.558,463.238 327.842,345.626"></polygon>
              <polygon style={{fill: '#E68900'}} points="231.519,395.086 186.248,345.626 140.225,402.122 137.532,463.238 183.091,512"></polygon>
              <polygon style={{fill: '#FFAD00'}} points="119.26,348.593 70.836,465.502 137.532,463.238 186.248,345.626"></polygon>
              <path style={{fill: '#FFCE2A'}} d="M254.955,0l-20.899,201.532l20.899,201.531c111.303,0,201.532-90.229,201.532-201.532 S366.258,0,254.955,0z"></path>
              <path style={{fill: '#FDEB95'}} d="M55.513,201.532c0,111.303,90.229,201.532,201.532,201.532V0C145.742,0,55.513,90.229,55.513,201.532 z"></path>
              <path style={{fill: '#E68900'}} d="M257.045,45.098l-20.899,156.434l20.899,156.433c86.258,0,156.434-70.175,156.434-156.434 C413.479,115.273,343.303,45.098,257.045,45.098z"></path>
              <path style={{fill: '#FFAD00'}} d="M100.611,201.531c0,86.258,70.175,156.434,156.434,156.434V45.098 C170.786,45.098,100.611,115.273,100.611,201.531z"></path>
              <path style={{fill: '#6CD800'}} d="M315.279,162.202c-6.013,0-14.11,1.354-22.672,3.768c2.413-8.562,3.768-16.659,3.768-22.672 c0-21.721-17.609-39.329-39.329-39.329l-22.077,97.564l22.076,97.562c21.721,0,39.329-17.609,39.329-39.329 c0-6.013-1.354-14.11-3.768-22.672c8.562,2.413,16.659,3.768,22.672,3.768c21.721,0,39.33-17.609,39.33-39.329 C354.609,179.81,337,162.202,315.279,162.202z"></path>
              <path style={{fill: '#93F340'}} d="M217.716,143.296c0,6.013,1.354,14.11,3.768,22.672c-8.562-2.413-16.659-3.768-22.672-3.768 c-21.721,0-39.33,17.609-39.33,39.33s17.609,39.329,39.33,39.329c6.013,0,14.11-1.354,22.672-3.768 c-2.413,8.562-3.768,16.659-3.768,22.672c0,21.721,17.609,39.329,39.329,39.329V103.967 C235.324,103.967,217.716,121.576,217.716,143.296z"></path>
            </g>
          </svg>
        );
      default:
        return (
          <svg viewBox="-3.5 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <circle cx="12" cy="12" r="10" fill="#6B7280"></circle>
            <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12">?</text>
          </svg>
        );
    }
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'earnings': return '💰';
      case 'orders': return '📦';
      case 'ratings': return '⭐';
      default: return '🏆';
    }
  };

  const getStreakIcon = (streakCount: number) => {
    if (streakCount >= 12) return '🔥👑';
    if (streakCount >= 5) return '🔥⚡';
    if (streakCount >= 3) return '🔥';
    return '🔥';
  };

  const formatCurrentValue = (achievement: Achievement) => {
    switch (achievement.type) {
      case 'earnings':
        return formatCurrencySync(achievement.current);
      case 'orders':
        return `${achievement.current} orders`;
      case 'ratings':
        return `${achievement.current.toFixed(1)}/5`;
      default:
        return achievement.current.toString();
    }
  };

  const formatTargetValue = (achievement: Achievement) => {
    switch (achievement.type) {
      case 'earnings':
        return formatCurrencySync(achievement.target);
      case 'orders':
        return `${achievement.target} orders`;
      case 'ratings':
        return `${achievement.target}/5`;
      default:
        return achievement.target.toString();
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        {/* Modern Header Skeleton */}
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className={`w-10 h-10 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} animate-pulse`}></div>
          <div>
            <div className={`h-5 w-32 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded animate-pulse mb-1`}></div>
            <div className={`h-3 w-24 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded animate-pulse`}></div>
          </div>
        </div>
        
        {/* Summary Stats Skeleton */}
        <div className={`mb-6 grid grid-cols-3 gap-2 sm:gap-4 rounded-2xl p-4 sm:p-6 ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} animate-pulse`}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
              <div className={`h-6 w-8 mx-auto mb-1 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded`}></div>
              <div className={`h-3 w-12 mx-auto ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded`}></div>
            </div>
          ))}
        </div>
        
        {/* Achievement Cards Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`rounded-2xl p-4 sm:p-5 ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} animate-pulse`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
                  <div className="flex-1">
                    <div className={`h-4 w-24 mb-1 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded`}></div>
                    <div className={`h-3 w-16 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded`}></div>
                  </div>
                </div>
                <div className={`w-12 h-6 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full`}></div>
              </div>
              <div className={`h-2 w-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!achievementData) {
    return (
      <div className="w-full">
        <h3 className={`mb-3 sm:mb-4 text-base sm:text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Achievement Badges
        </h3>
        <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center px-4">
          <div className={`${theme === "dark" ? "text-gray-400" : "text-gray-400"} mb-2`}>🏆</div>
          <p className={`text-sm sm:text-base ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Unable to load achievements</p>
        </div>
      </div>
    );
  }

  const { achieved, pending, summary } = achievementData;

  return (
    <div className="w-full">
      {/* Modern Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${theme === "dark" ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20" : "bg-gradient-to-br from-yellow-100 to-orange-100"}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6 text-yellow-500">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21l-1.25.5c-.5.2-1.28.2-1.78 0l-1.25-.5c-.5-.23-.97-.66-.97-1.21v-2.34" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21l1.25.5c.5.2 1.28.2 1.78 0l1.25-.5c.5-.23.97-.66.97-1.21v-2.34" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <div>
            <h3 className={`text-lg sm:text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Achievement Badges
            </h3>
            <p className={`text-xs sm:text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Unlock rewards for your performance
            </p>
          </div>
        </div>
      </div>
      
      {/* Modern Summary Stats */}
      <div className={`mb-6 grid grid-cols-3 gap-2 sm:gap-4 rounded-2xl p-4 sm:p-6 ${theme === "dark" ? "bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600" : "bg-gradient-to-r from-white to-gray-50 border border-gray-200"} shadow-lg`}>
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-2 ${theme === "dark" ? "bg-green-500/20" : "bg-green-100"}`}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 sm:h-8 sm:w-8 text-green-500">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-green-500">{summary.totalAchieved}</div>
          <div className={`text-xs sm:text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Earned</div>
        </div>
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-2 ${theme === "dark" ? "bg-orange-500/20" : "bg-orange-100"}`}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-orange-500">{summary.totalPending}</div>
          <div className={`text-xs sm:text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>In Progress</div>
        </div>
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-2 ${theme === "dark" ? "bg-purple-500/20" : "bg-purple-100"}`}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-purple-500">{achieved.length + pending.length}</div>
          <div className={`text-xs sm:text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Total</div>
        </div>
      </div>

      {/* Achieved Badges */}
      {achieved.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className={`p-1.5 rounded-lg ${theme === "dark" ? "bg-green-500/20" : "bg-green-100"}`}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-green-500">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className={`text-base sm:text-lg font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
              Achieved This Month
            </h4>
          </div>
          <div className="space-y-3">
            {achieved.map((achievement, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 ${
                  theme === "dark" 
                    ? "bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-500/30" 
                    : "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                } shadow-lg`}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl bg-white/10 backdrop-blur-sm">
                        {getBadgeIcon(achievement.level)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{getTypeIcon(achievement.type)}</span>
                          <Whisper
                            speaker={<Tooltip>{achievement.description}</Tooltip>}
                            placement="top"
                          >
                            <span className={`text-sm sm:text-base font-bold truncate ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}>
                              {achievement.badgeName}
                            </span>
                          </Whisper>
                        </div>
                        <div className={`text-xs ${theme === "dark" ? "text-green-300" : "text-green-600"}`}>
                          {formatCurrentValue(achievement)} / {formatTargetValue(achievement)}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      theme === "dark" ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700"
                    }`}>
                      {achievement.level.toUpperCase()}
                    </div>
                  </div>
                  
                  {achievement.streakCount && achievement.streakCount > 1 && (
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      theme === "dark" ? "bg-orange-500/20 text-orange-300" : "bg-orange-100 text-orange-600"
                    }`}>
                      <span>{getStreakIcon(achievement.streakCount)}</span>
                      <span>Streak x{achievement.streakCount}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Badges */}
      {pending.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className={`p-1.5 rounded-lg ${theme === "dark" ? "bg-blue-500/20" : "bg-blue-100"}`}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-blue-500">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className={`text-base sm:text-lg font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
              Working Towards
            </h4>
          </div>
          <div className="space-y-3">
            {pending.slice(0, 6).map((achievement, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 ${
                  theme === "dark" 
                    ? "bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/50" 
                    : "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
                } shadow-lg`}
              >
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl bg-white/5 backdrop-blur-sm">
                        {getBadgeIcon(achievement.level)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{getTypeIcon(achievement.type)}</span>
                          <Whisper
                            speaker={<Tooltip>{achievement.description}</Tooltip>}
                            placement="top"
                          >
                            <span className={`text-sm sm:text-base font-bold truncate ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}>
                              {achievement.badgeName}
                            </span>
                          </Whisper>
                        </div>
                        <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {formatCurrentValue(achievement)} / {formatTargetValue(achievement)}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      theme === "dark" ? "bg-gray-500/20 text-gray-300" : "bg-gray-100 text-gray-700"
                    }`}>
                      {achievement.level.toUpperCase()}
                    </div>
                  </div>
                  
                  {/* Modern Progress Bar */}
                  <div className="mb-3">
                    <div className={`flex justify-between items-center mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}>
                      <span className="text-xs font-medium">Progress</span>
                      <span className="text-xs font-bold">{achievement.progress}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    }`}>
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {pending.length > 6 && (
            <div className="mt-4 text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                theme === "dark" ? "bg-gray-800/50 text-gray-400" : "bg-gray-100 text-gray-600"
              }`}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>And {pending.length - 6} more badges to unlock...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No achievements message */}
      {achieved.length === 0 && pending.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
          <div className={`relative mb-6 ${theme === "dark" ? "text-gray-600" : "text-gray-300"}`}>
            <div className="text-6xl sm:text-7xl mb-2">🏆</div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <h4 className={`mb-3 text-xl sm:text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Begin Your Achievement Journey
          </h4>
          <p className={`text-sm sm:text-base max-w-md ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Complete orders, earn great ratings, and reach monthly targets to unlock your first achievement badges!
          </p>
          <div className={`mt-6 px-6 py-3 rounded-full ${theme === "dark" ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30" : "bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200"}`}>
            <span className={`text-sm font-medium ${theme === "dark" ? "text-yellow-300" : "text-yellow-700"}`}>
              Start earning badges today! 🚀
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementBadges;
