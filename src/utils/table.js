export const saveTable = (table) => {
  if (table) {
    localStorage.setItem("table", table);
  }
};

export const getTable = () => {
  return localStorage.getItem("table");
};
