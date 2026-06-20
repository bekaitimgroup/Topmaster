import uz from './uz';
import ru from './ru';

export type { Lang } from './uz';
export type LangCode = 'uz' | 'ru';

export const translations = { uz, ru } as const;
export { uz, ru };
