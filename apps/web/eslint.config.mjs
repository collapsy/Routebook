import routeBookNextConfig from "@routebook/eslint-config/next";

const routeBookWebConfig = [{ ignores: ["vendor/**"] }, ...routeBookNextConfig];

export default routeBookWebConfig;
