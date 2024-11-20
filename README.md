# Log-Parser task

## Instructions

### Step 1: Parse the "BASE64" log lines into JSON file

Assuming you have `Node.js` and package manager for it i.e. `npm` or `pnpm` installed on your system. If not installed, you can refer the [Node.js](https://datkumar.github.io/Configs/NodeJs/) section on my [Configs page](https://datkumar.github.io/Configs/) for installation on Linux

- Install dependencies: `npm i` or `pnpm i`
- Run the `start` script: `npm start` or `pnpm start`

The script processes all the log lines starting with `BASE64:`, converts them into respective `UserEvent` model objects and saves them in the `base64-processed.json` in the `output` folder. The [Zod](https://zod.dev/) library is used for defining and validating schemas

Also note the `base64-undecoded.log` and `base64-invalidated.log` files in output folder that could either not be decoded or did not pass the schema-validation

(The logs did not have any base64 encoded images to display)

### Step 2: Visualize the user events in Google Colab notebook

Refer [my Colab notebook](https://colab.research.google.com/drive/1Uq7mWDLBC2PYK0aJahd6FzaWpHKZfqRH#scrollTo=uS2j2eSSC9Cb) for the visualization code. Change the `jsonFileUrl` to the URL of your respective output file

### Other tools used

[base64decode.org](https://www.base64decode.org/), [json-pretty-print](https://jsonformatter.org/json-pretty-print), [quicktype.io](https://app.quicktype.io/)
