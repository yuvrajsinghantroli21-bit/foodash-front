export const getRestaurantSlug = () => {
  const host = window.location.hostname;

  if (host === "localhost" || host === "127.0.0.1") {
    return "";
  }

  if (host.endsWith(".localhost")) {
    return host.replace(".localhost", "");
  }

  if (
    host.endsWith(".qzora.in") &&
    host !== "qzora.in" &&
    host !== "www.qzora.in"
  ) {
    return host.replace(".qzora.in", "");
  }

  if (
    host.endsWith(".foodash.com") &&
    host !== "foodash.com" &&
    host !== "www.foodash.com"
  ) {
    return host.replace(".foodash.com", "");
  }

  return "";
};
