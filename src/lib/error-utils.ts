import { toast } from 'sonner';

/**
 * Professional Error Handler for API responses and unexpected errors.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleApiError = (error: any, fallbackMessage: string = "Request failed") => {
  console.error("DEBUG: API Error", error);
  
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || fallbackMessage;
    
    switch (status) {
      case 400:
        // Verification or validation error
        toast.error(message || "Invalid request. Please check your inputs.");
        break;
      case 401:
        toast.error("Session expired. Please log in again.");
        break;
      case 402:
        toast.warning(message || "Insufficient credits. Please upgrade your plan.");
        break;
      case 403:
        // Differentiate between generic and specific forbidden messages
        if (message.toLowerCase().includes("denied") || message.toLowerCase().includes("owner")) {
           toast.error("🛑 Security Alert: " + message);
        } else {
           toast.error("Access Forbidden. You don't have permission for this action.");
        }
        break;
      case 404:
        toast.error(message || "Resource not found.");
        break;
      case 429:
        toast.error("Slow down! Too many requests. Try again in a minute.");
        break;
      case 500:
        toast.error("Server's having a bad day. We're on it!");
        break;
      default:
        toast.error(message);
    }
  } else if (error.request) {
    toast.error("Network issue. Check your connection!");
  } else {
    toast.error(fallbackMessage);
  }
};
