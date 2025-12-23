import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useFeedbacks() {
  return useQuery({
    queryKey: [api.feedbacks.list.path],
    queryFn: async () => {
      const res = await fetch(api.feedbacks.list.path);
      if (!res.ok) throw new Error("Failed to fetch feedbacks");
      return api.feedbacks.list.responses[200].parse(await res.json());
    },
  });
}
