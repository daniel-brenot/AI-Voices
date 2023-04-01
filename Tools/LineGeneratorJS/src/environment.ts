import { cleanEnv, str } from 'envalid'

export const env = cleanEnv(process.env, {
    ELVENAI_API_KEY: str({desc: "API key from ElvenAI"}),
    GENERATE_RACE: str({desc: "The race you want to generate voice lines for", default: "all"}),
});
