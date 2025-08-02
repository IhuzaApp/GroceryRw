import React from "react";
import { Dropdown, Button } from "rsuite";
import "rsuite/dist/rsuite.min.css";

interface SortDropdownProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  onNearbyClick: () => void;
  isNearbyActive: boolean;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  sortBy,
  onSortChange,
  onNearbyClick,
  isNearbyActive,
}) => {
  // Helper function to display sort option names
  const getSortDisplayName = (key: string) => {
    switch (key) {
      case "name":
        return "Name";
      case "distance":
        return "Distance";
      case "rating":
        return "Rating";
      case "reviews":
        return "Reviews";
      case "delivery_time":
        return "Delivery Time";
      default:
        return key;
    }
  };

  return (
    <>
      <div className="relative">
        <Dropdown
          title={`Sort by ${getSortDisplayName(sortBy)}`}
          onSelect={(value) => onSortChange(value as string)}
          className="!min-w-[140px] md:!min-w-[160px]"
        >
          <Dropdown.Item eventKey="name" className="!py-3 !text-sm">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Sort by Name</span>
            </div>
          </Dropdown.Item>
          <Dropdown.Item eventKey="distance" className="!py-3 !text-sm">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Sort by Distance</span>
            </div>
          </Dropdown.Item>
          <Dropdown.Item eventKey="rating" className="!py-3 !text-sm">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Sort by Rating</span>
            </div>
          </Dropdown.Item>
          <Dropdown.Item eventKey="reviews" className="!py-3 !text-sm">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Sort by Reviews</span>
            </div>
          </Dropdown.Item>
          <Dropdown.Item eventKey="delivery_time" className="!py-3 !text-sm">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Sort by Delivery Time</span>
            </div>
          </Dropdown.Item>
        </Dropdown>
      </div>
      <Button
        onClick={onNearbyClick}
        className={`!rounded-full !px-3 !py-2 !text-sm !transition-all !duration-200 ${
          isNearbyActive
            ? "!border-green-600 !bg-green-600 !text-white"
            : "!border-gray-200 !bg-gray-100 !text-gray-700 hover:!bg-gray-200 dark:!border-gray-700 dark:!bg-gray-800 dark:!text-gray-200 dark:hover:!bg-gray-700"
        }`}
      >
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{isNearbyActive ? "Nearby Live" : "Nearby"}</span>
        </div>
      </Button>
    </>
  );
};

export default SortDropdown;
