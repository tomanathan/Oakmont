import { Ball, Bowl, Bunting, C, DoorView, Plant, Shelf, Tape } from "./art";
import { OzhoPoke } from "./OzhoPoke";

// Ozho's room: the world layer, a diorama taped into the notebook. All of
// it is decoration (hidden from screen readers) except Ozho himself, who
// is a real button you can poke.
export function Room() {
  return (
    <div className="nb-dio">
      <Tape color={C.cyan} pattern="dots" className="nb-dio-tape nb-dio-tape--a" />
      <Tape color={C.tangerine} pattern="stripe" className="nb-dio-tape nb-dio-tape--b" />
      <div className="nb-room">
        <div aria-hidden>
          <div className="nb-wall" />
          <div className="nb-bunting">
            <Bunting />
          </div>
          <div className="nb-window">
            <div className="nb-window-glass">
              <div className="nb-sun" />
            </div>
          </div>
          <div className="nb-door">
            <div className="nb-door-in">
              <DoorView />
            </div>
          </div>
          <div className="nb-shelf">
            <Shelf />
          </div>
          <div className="nb-floor" />
          <div className="nb-plant">
            <Plant />
          </div>
          <div className="nb-rug" />
          <div className="nb-ball">
            <Ball />
          </div>
          <div className="nb-bowl">
            <Bowl />
          </div>
        </div>
        <OzhoPoke />
      </div>
    </div>
  );
}
