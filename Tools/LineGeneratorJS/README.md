# Automatic ElvenAI voice generator and line creator

This tool will read the progress of the mod and generate voices for characters
automatically by calling the ElvenAI API to generate new voices, as well as
generate the voice lines for said voices.

This tool should tell you the estimated number of voices, as well as show you a
progress bar indicating how long is left on the voice generation.\

# Prerequisites

You need to have nodejs installed. You should install the LTS version, not latest since the latest is usually unstable.

https://nodejs.org/en/download

# Configuration

Set the environment variable "OPENAI_API_KEY" to your api key from elven labs.
The program wll pick this up and automatically use it.

If you wish to only generate voice lines for a specific race and gender, specify that
by setting the environment variable `GENERATE_RACE` to the appropriate value.

For example, if you only wanted to generate voice lines for breton females, you would
put "Breton Female" as the value.

# Running



Then run `npm install` to install the dependencies for the project.

Lastly, you can run `npm run-script start` to run the code. Enjoy!

