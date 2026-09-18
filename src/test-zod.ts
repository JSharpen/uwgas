import { AppPersistedStateSchema } from './state/schema';
import { useStore } from './state/store';

const defaultState = useStore.getState();
const result = AppPersistedStateSchema.safeParse(defaultState);

if (!result.success) {
  console.error("Zod Validation Failed on Default State:");
  console.error(JSON.stringify(result.error.issues, null, 2));
} else {
  console.log("Default state is valid!");
}
