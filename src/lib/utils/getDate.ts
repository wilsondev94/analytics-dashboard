import { format, subDays } from "date-fns";

export const getDate = (sub: number = 0) => {
  const dateOfDaysAgo = subDays(new Date(), sub);

  return format(dateOfDaysAgo, "dd/MM/yyyy");
};
