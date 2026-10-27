import "./notebook.css";
import { Nav } from "./Nav";

// The homepage's top bar, menus and all, for the public pages a visitor
// reads on the way in (the sample parent dashboard, the legal pages). It
// sits across the top of the window instead of on the notebook page.
// Styles: .nb-sitebar in notebook.css.
export function SiteHeader() {
  return (
    <div className="nb-root nb-sitebar">
      <Nav home={false} />
    </div>
  );
}
