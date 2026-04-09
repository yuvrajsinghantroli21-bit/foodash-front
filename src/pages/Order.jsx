import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { saveTable } from "../utils/table";

import Menu from "./Menu";

function Order() {
  const [params] = useSearchParams();

  useEffect(() => {
    const table = params.get("table");

    if (table) {
      saveTable(table);
    }
  }, [params]);

  return (
    <div className="min-h-screen">
      {/* Menu Component */}
      <Menu />
    </div>
  );
}

export default Order;
