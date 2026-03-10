import { useState, useEffect } from "react";

export interface Module {
    id: string;
    name: string;
    slug: string;
    group_name: string;
    created_at: string;
}

export interface Plan {
    id: string;
    name: string;
    description: string;
    price_monthly: number;
    price_yearly: number;
    ai_request_limit: number;
    reel_limit: number;
    created_at: string;
    modules: Module[];
}

export const usePlans = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("/api/queries/pos-pricing-plans");
                if (!response.ok) {
                    throw new Error("Failed to fetch pricing plans");
                }
                const data = await response.json();
                setPlans(data.plans || []);
                setIsError(false);
            } catch (err) {
                console.error("Error in usePlans hook:", err);
                setIsError(true);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlans();
    }, []);

    return {
        plans,
        isLoading,
        isError,
        error,
    };
};

