"use client";

import { useCallback, useEffect, useState } from "react";
import * as interviewApi from "../services/interviewApi";
import type { InterviewRecord } from "../types/interview";

export function useInterviewList(refetchKey?: string | number) {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await interviewApi.listInterviewsLegacy();
      setInterviews(list);
    } catch (e) {
      setError("Failed to load interviews");
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch, refetchKey]);

  return { interviews, loading, error, refetch };
}
