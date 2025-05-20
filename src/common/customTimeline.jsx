import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { MdOutlineDelete, MdExpandCircleDown } from "react-icons/md";
import { FaChevronDown, FaChevronUp, FaClock } from "react-icons/fa";
import { FaNoteSticky } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { getFadedColor } from "../utils";

const isLightColor = (color) => {
  if (!color) return true;
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
};

const AdPlaceholder = ({ type = "banner" }) => {
  const sizes = {
    banner: { width: "320px", height: "100px" },
    square: { width: "300px", height: "250px" },
  };
  const { width, height } = sizes[type];
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: "#e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        margin: "8px auto",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <span style={{ color: "#666", fontSize: "14px" }}>
        Test Ad ({type}: {width} x {height})
      </span>
    </div>
  );
};

const CustomTimeline = ({
  tasks,
  onEdit,
  onDelete,
  newTaskCount,
  updatedTaskCount,
}) => {
  const [expandedTasks, setExpandedTasks] = useState({});
  const [highlightedTask, setHighlightedTask] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [lineHeights, setLineHeights] = useState({});
  const [lastAdTime, setLastAdTime] = useState(null);
  const [showRandomAd, setShowRandomAd] = useState(false);
  const scrollContainerRef = useRef(null);
  const taskRefs = useRef({});
  const dotRefs = useRef({});

  const sortedTasksWithAds = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => a.timestamp - b.timestamp);
    const result = [];
    sorted.forEach((task, index) => {
      result.push(task);
      if (index < sorted.length - 1 && (index + 1) % 5 === 0) {
        result.push({ id: `ad-${index}`, isAd: true });
      }
    });
    return result;
  }, [tasks]);

  const totalNewItems = useMemo(
    () => newTaskCount + updatedTaskCount,
    [newTaskCount, updatedTaskCount]
  );

  const toggleExpanded = useCallback(
    (taskId) => {
      const now = Date.now();
      const adInterval = 15 * 60 * 1000; // 15 minutes in milliseconds
      if (!lastAdTime || now - lastAdTime >= adInterval) {
        setShowRandomAd(true);
        setLastAdTime(now);
        setTimeout(() => setShowRandomAd(false), 5000); // Hide ad after 5 seconds
      }
      setExpandedTasks((prev) => ({
        ...prev,
        [taskId]: !prev[taskId],
      }));
    },
    [lastAdTime]
  );

  const handleEdit = useCallback((task) => onEdit(task), [onEdit]);
  const handleDelete = useCallback((taskId) => onDelete(taskId), [onDelete]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const isUserAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
    setIsAtBottom(isUserAtBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      // Find the last task (excluding ads)
      const lastTask = sortedTasksWithAds
        .filter((item) => !item.isAd)
        .slice(-1)[0];
      if (lastTask) {
        const lastTaskElement = document.getElementById(`task-${lastTask.id}`);
        if (lastTaskElement) {
          lastTaskElement.scrollIntoView({ behavior: "smooth", block: "end" });
        } else {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }
      setIsAtBottom(true);
    }
  }, [sortedTasksWithAds]);

  useEffect(() => {
    const calculateLineHeights = () => {
      const heights = {};
      sortedTasksWithAds.forEach((item, index) => {
        if (index === sortedTasksWithAds.length - 1) {
          heights[item.id] = 0;
          return;
        }
        const currentDot = dotRefs.current[item.id];
        const nextItem = sortedTasksWithAds[index + 1];
        // Only calculate height to next task, skipping ads
        const nextTaskIndex = sortedTasksWithAds.findIndex(
          (t, i) => i > index && !t.isAd
        );
        const nextDot =
          nextTaskIndex !== -1
            ? dotRefs.current[sortedTasksWithAds[nextTaskIndex]?.id]
            : null;
        if (currentDot && nextDot && !nextItem.isAd) {
          const currentDotRect = currentDot.getBoundingClientRect();
          const nextDotRect = nextDot.getBoundingClientRect();
          const currentDotCenter =
            currentDotRect.top + currentDotRect.height / 2;
          const nextDotCenter = nextDotRect.top + nextDotRect.height / 2;
          const distance = Math.max(nextDotCenter - currentDotCenter, 0);
          heights[item.id] = distance;
        } else {
          heights[item.id] = expandedTasks[item.id] ? 180 : 80;
        }
      });
      setLineHeights(heights);
    };

    calculateLineHeights();
    const observer = new ResizeObserver(calculateLineHeights);
    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current);
    }
    return () => observer.disconnect();
  }, [sortedTasksWithAds, expandedTasks]);

  useEffect(() => {
    const calculateLineHeights = () => {
      const heights = {};
      sortedTasksWithAds.forEach((item, index) => {
        if (item.isAd) {
          heights[item.id] = 120; // Fixed height for ads
          return;
        }
        if (index === sortedTasksWithAds.length - 1) {
          heights[item.id] = 0; // No line after the last task
          return;
        }
        const currentDot = dotRefs.current[item.id];
        const nextItem = sortedTasksWithAds[index + 1];
        // Only calculate height to next task, skipping ads
        const nextTaskIndex = sortedTasksWithAds.findIndex(
          (t, i) => i > index && !t.isAd
        );
        const nextDot =
          nextTaskIndex !== -1
            ? dotRefs.current[sortedTasksWithAds[nextTaskIndex]?.id]
            : null;
        if (currentDot && nextDot && !nextItem.isAd) {
          const currentDotRect = currentDot.getBoundingClientRect();
          const nextDotRect = nextDot.getBoundingClientRect();
          const currentDotCenter =
            currentDotRect.top + currentDotRect.height / 2;
          const nextDotCenter = nextDotRect.top + nextDotRect.height / 2;
          const distance = Math.max(nextDotCenter - currentDotCenter, 0);
          heights[item.id] = distance;
        } else {
          heights[item.id] = expandedTasks[item.id] ? 180 : 80; // Default height
        }
      });
      setLineHeights(heights);
    };

    calculateLineHeights();
    const observer = new ResizeObserver(calculateLineHeights);
    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current);
    }
    return () => observer.disconnect();
  }, [sortedTasksWithAds, expandedTasks]);

  return (
    <div className="flex-1 bg-white relative h-full overflow-hidden w-full">
      {totalNewItems > 0 && !isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 font-medium text-sm py-1 px-3 rounded-b-md shadow z-10"
        >
          {totalNewItems} new item{totalNewItems > 1 ? "s" : ""}
        </button>
      )}

      {showRandomAd && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
          }}
        >
          <AdPlaceholder type="banner" />
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className="max-h-[calc(100vh-180px)] overflow-y-auto px-3 py-4 space-y-2 w-full scrollbar-hide pb-16" // Added pb-16
        onScroll={handleScroll}
      >
        {sortedTasksWithAds.map((item, index) => {
          if (item.isAd) {
            return (
              <div key={item.id} className="flex justify-center my-2">
                <AdPlaceholder type="banner" />
              </div>
            );
          }

          const isExpanded = expandedTasks[item.id];
          const isCompleted = item?.status === true;
          const currentTime = Date.now();
          const isOverdue = !isCompleted && item.timestamp < currentTime;
          const backgroundColor = isOverdue
            ? "#f8f9fa"
            : getFadedColor(item.title);
          const textColor = isLightColor(backgroundColor)
            ? "#1f2937"
            : "#f9fafb";
          const iconColor = isLightColor(backgroundColor)
            ? "#1f2937"
            : "#f9fafb"; // Added for icons
          const dotColor = isCompleted
            ? "#ADD8E6"
            : isOverdue
            ? "#d1d5db"
            : "#6b7280";
          const innerDotColor = isCompleted
            ? "#E0FFFF"
            : isOverdue
            ? "#d1d5db"
            : "#ffffff";
          const timelineColor = isCompleted
            ? "#ADD8E6"
            : isOverdue
            ? "#d1d5db"
            : "#6b7280";
          const cardBorderColor = isOverdue ? "#d1d5db" : "#e5e7eb";

          return (
            <div
              key={item.id}
              id={`task-${item.id}`}
              className="flex items-start space-x-0 w-full"
            >
              <div className="flex flex-col items-center ml-5 min-w-[60px] sm:min-w-[60px]">
                <div className="relative flex flex-col items-center">
                  <span className="text-xs text-gray-700 font-medium absolute mt-1 -left-9 sm:-left-9">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                  <div
                    ref={(el) => (dotRefs.current[item.id] = el)}
                    className="relative z-1 w-3 h-3 rounded-full mt-1 ml-5"
                    style={{ backgroundColor: dotColor }}
                  >
                    <div
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: innerDotColor,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  </div>
                  {index !== sortedTasksWithAds.length - 1 &&
                    !sortedTasksWithAds[index + 1]?.isAd && (
                      <div
                        className="absolute top-4 w-0.5 ml-5"
                        style={{
                          height: lineHeights[item.id] || 80,
                          backgroundColor: timelineColor,
                        }}
                      />
                    )}
                </div>
              </div>

              <motion.div
                ref={(el) => (taskRefs.current[item.id] = el)}
                className="bg-white rounded-[8px] overflow-hidden shadow-sm p-3 mt-1 transition-all duration-300 flex-1 w-full"
                style={{ borderColor: cardBorderColor }}
                animate={{
                  backgroundColor:
                    item.id === highlightedTask ? "#fef08a" : backgroundColor,
                }}
                transition={{ duration: 0.4 }}
              >
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="flex items-center justify-between w-full"
                >
                  <div className="text-left flex-1 pr-2 overflow-hidden">
                    <h3
                      className={`text-sm font-semibold ${
                        isExpanded ? "break-words" : "truncate"
                      }`}
                      style={{ color: textColor }}
                    >
                      {item.title}
                    </h3>
                    {!isExpanded && item.description && (
                      <p
                        className="text-xs  mt-1 truncate"
                        style={{ color: textColor }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                  {isExpanded ? (
                    <FaChevronUp size={14} color={iconColor} />
                  ) : (
                    <FaChevronDown size={14} color={iconColor} />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-0">
                        {item.description && (
                          <p
                            className="text-gray-700 break-words text-xs"
                            style={{ color: textColor }}
                          >
                            {item.description}
                          </p>
                        )}
                        {item.alert && (
                          <div
                            className="flex items-center space-x-2 text-gray-600 text-xs mt-2"
                            style={{ color: textColor }}
                          >
                            <FaClock size={14} color={iconColor} />
                            <span>
                              Alert:{" "}
                              {item.alertMinutes === 0
                                ? "at"
                                : `${item.alertMinutes} min before at`}{" "}
                              {new Date(
                                item.alertMinutes === 0
                                  ? item.timestamp
                                  : item.timestamp - item.alertMinutes * 60000
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                          </div>
                        )}
                        {item.note && (
                          <div
                            className="flex items-start space-x-2 text-gray-600 text-xs mt-2"
                            style={{ color: textColor }}
                          >
                            <FaNoteSticky
                              color={iconColor}
                              size={14}
                              className="mt-0.5 flex-shrink-0"
                            />
                            <p className="break-words">
                              <strong>Note:</strong> {item.note}
                            </p>
                          </div>
                        )}
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                          >
                            <AiOutlineEdit size={16} color={iconColor} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                          >
                            <MdOutlineDelete size={16} color={iconColor} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}
      </div>
<button
  onClick={scrollToBottom}
  className="fixed bottom-[calc(6%+env(safe-area-inset-bottom)+0.5rem)] right-4 bg-gray-300 hover:bg-gray-400 p-2 rounded-full shadow-md z-[1100]"
>
  <MdExpandCircleDown size={20} />
</button>
    </div>
  );
};

export default React.memo(CustomTimeline, (prevProps, nextProps) => {
  return (
    prevProps.tasks === nextProps.tasks &&
    prevProps.newTaskCount === nextProps.newTaskCount &&
    prevProps.updatedTaskCount === nextProps.updatedTaskCount &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete
  );
});
