import { z } from 'zod';

// Add Zod validation schema for email
const emailSchema = z.string().email().message('Must be a valid email');

// Existing forgotPassword function
const forgotPassword = useCallback(async (email) => {
  setLoading(true);
  try {
    return await resetPassword({ username: email });
  } catch (error) {
    throw toReadableAuthError(error);
  } finally {
    setLoading(false);
  }
}, []);

// Export validation function
export const validateEmail = (email: string) => {
  try {
    emailSchema.parse(email);
    return true;
  } catch (error) {
    return error.message;
  }
};