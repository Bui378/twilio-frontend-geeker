import React from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';

const EditIcon = () => {
    return <>
        <div className="edit-icon-round-div d-flex justify-content-center align-items-center">
            <FontAwesomeIcon icon={faPen} className="edit-fa-icon" />
        </div>
    </>
}

export default EditIcon