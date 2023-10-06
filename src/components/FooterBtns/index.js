import React from "react";
import NewSquareBtn from "components/NewSquareBtn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const FooterBtns = ({
  onPrev,
  onNext,
  footerNote,
  hidePrevBtn,
  showSpinner,
  availabilityPage,
  saveForLater,
  hideSaveForLater,
  hideNextBtn,
  disable,
  disableNextBtn
}) => {

  return (
    <>
      <div
        className={
          "d-flex align-items-center " +
          (hidePrevBtn === "yes"
            ? "justify-content-end "
            : "justify-content-between ") +
          (availabilityPage === true ? "btn-footer-avail" : "btn-footer")
        }
      >
        <div
          className={
            "d-flex align-items-center " +
            (availabilityPage === true
              ? "btn-footer-avail-div"
              : "btn-footer-div")
          }
        >
          {hidePrevBtn !== "yes" && !disable && (
            <NewSquareBtn type={"previous"} onPrev={onPrev} />
          )}
          {footerNote !== undefined && footerNote !== "" && (
            <div className="d-flex justify-content-between align-items-center footerNoteSpanCoontainer">
              <FontAwesomeIcon className="info-icon" icon={faInfoCircle} />
              &nbsp;&nbsp;&nbsp;
              <span className="footerNoteSpan">{footerNote}</span>
            </div>
          )}
        </div>
        <div
          className={
            "d-flex align-items-center " +
            (availabilityPage === true
              ? "btn-footer-avail-div"
              : "btn-footer-div")
          }
        >
          {!hideSaveForLater && <span onClick={saveForLater} className="save-for-later">
            Save for later
          </span>}
          {!hideNextBtn &&
            <NewSquareBtn
              type={"next"}
              onNext={onNext}
              showSpinner={showSpinner}
              disableNextBtn={disableNextBtn}
            />}
        </div>
      </div>
    </>
  );
};

export default FooterBtns;
