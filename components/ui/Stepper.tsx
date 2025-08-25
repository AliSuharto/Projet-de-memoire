'use client';

import { Check } from 'lucide-react';

export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  className?: string;
}

const Stepper = ({ steps, currentStep, className = '' }: StepperProps) => {
  return (
    <nav aria-label="Progress" className={className}>
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <li key={step.id} className="md:flex-1">
              <div
                className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${
                  isCompleted
                    ? 'border-blue-600'
                    : isCurrent
                    ? 'border-blue-600'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full">
                    {isCompleted ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                        <Check className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                    ) : isCurrent ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-600 bg-white">
                        <span className="text-blue-600 font-semibold">{stepNumber}</span>
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                        <span className="text-gray-500 font-semibold">{stepNumber}</span>
                      </div>
                    )}
                  </span>
                  <div className="ml-4 min-w-0 flex-1">
                    <span
                      className={`text-sm font-medium ${
                        isCompleted || isCurrent ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                    {step.description && (
                      <span
                        className={`text-sm ${
                          isCompleted || isCurrent ? 'text-blue-500' : 'text-gray-500'
                        }`}
                      >
                        {step.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;
