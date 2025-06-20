import React, { useState, useEffect } from "react";
import { Panel, Button, InputNumber, Modal } from "rsuite";

interface Goal {
  goal: string;
  current: number;
  target: number;
  percentage: number;
}

interface EarningsGoalsProps {
  goals: Goal[] | null;
}

const EarningsGoals: React.FC<EarningsGoalsProps> = ({
  goals: initialGoals,
}) => {
  const [goals, setGoals] = useState<Goal[] | null>(initialGoals);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newTarget, setNewTarget] = useState<number>(0);

  // Update goals state when props change
  useEffect(() => {
    setGoals(initialGoals);
  }, [initialGoals]);

  // Format currency for display in RWF
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0, // RWF typically doesn't use decimal places
    }).format(amount);
  };

  // Handle opening the edit modal
  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewTarget(goal.target);
    setShowEditModal(true);
  };

  // Handle saving the edited goal
  const handleSaveGoal = () => {
    if (!editingGoal || !goals) return;

    const updatedGoals = goals.map((goal) => {
      if (goal.goal === editingGoal.goal) {
        const newPercentage = Math.round((goal.current / newTarget) * 100);
        return {
          ...goal,
          target: newTarget,
          percentage: newPercentage,
        };
      }
      return goal;
    });

    setGoals(updatedGoals);
    setShowEditModal(false);
    setEditingGoal(null);
  };

  // Show error message if goals data is missing
  if (!goals) {
    return (
      <Panel shaded bordered bodyFill className="p-4">
        <h3 className="mb-4 text-lg font-semibold">Earnings Goals</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="mb-4 h-12 w-12 text-gray-400"
          >
            <path d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          </svg>
          <h4 className="mb-2 text-lg font-medium text-gray-900">
            Goals Data Unavailable
          </h4>
          <p className="text-gray-600">
            Unable to load your earnings goals at the moment. Please try again in about 1 hour.
          </p>
        </div>
      </Panel>
    );
  }

  return (
    <>
      <Panel shaded bordered bodyFill className="p-4">
        <h3 className="mb-4 text-lg font-semibold">Earnings Goals</h3>
        <div className="space-y-6">
          {goals.map((item, index) => (
            <div key={index}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium">{item.goal}</span>
                  <Button
                    appearance="link"
                    size="xs"
                    onClick={() => handleEditGoal(item)}
                    className="ml-2 p-0 text-blue-500"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-3 w-3"
                    >
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                </div>
                <span className="text-sm">
                  {formatCurrency(item.current)} / {formatCurrency(item.target)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full ${
                    item.percentage >= 90
                      ? "bg-green-500"
                      : item.percentage >= 70
                      ? "bg-blue-500"
                      : item.percentage >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <div className="mt-1 text-right text-xs text-gray-500">
                {item.percentage}% of goal
              </div>
            </div>
          ))}

          <div className="mt-6 border-t pt-4">
            <h3 className="mb-3 font-medium">Tips to Increase Earnings</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  1
                </div>
                <span>
                  Shop during peak hours (Fri 4-8pm, Sat 10am-2pm, Sun 11am-3pm)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  2
                </div>
                <span>
                  Accept batch orders with multiple deliveries for higher
                  earnings
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  3
                </div>
                <span>
                  Focus on stores you&apos;re familiar with to shop faster
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  4
                </div>
                <span>
                  Maintain high customer ratings to qualify for bonus incentives
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Panel>

      {/* Edit Goal Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)}>
        <Modal.Header>
          <Modal.Title>Edit Goal Target</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingGoal && (
            <div>
              <p className="mb-4">Set a new target for {editingGoal.goal}</p>
              <div className="flex items-center">
                <span className="mr-2 text-lg">RWF</span>
                <InputNumber
                  value={newTarget}
                  onChange={(value) => setNewTarget(Number(value))}
                  min={0}
                  step={1000}
                  style={{ width: "100%" }}
                />
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Current progress: {formatCurrency(editingGoal.current)} (
                {Math.round((editingGoal.current / newTarget) * 100)}%)
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowEditModal(false)} appearance="subtle">
            Cancel
          </Button>
          <Button onClick={handleSaveGoal} appearance="primary">
            Save Goal
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EarningsGoals;
