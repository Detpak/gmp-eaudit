import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Checkmark({ value }) {
    return value != 0 ?
        <FontAwesomeIcon icon={faCheck} className="text-success" /> :
        <FontAwesomeIcon icon={faXmark} className="text-danger" />;
}
