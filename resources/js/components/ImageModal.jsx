import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faX } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import LoadingButton from "../components/LoadingButton";
import httpRequest from "../api";

export function ImageModal({ buttonSize, src, imageDescriptors, disabled }) {
    const [shown, setShown] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const [images, setImages] = useState(imageDescriptors ? imageDescriptors : []);

    const fetchData = async () => {
        const response = await httpRequest.get(src);
        setImages(response.data);
        setShown(true);
    };

    return (
        <>
            {src ?
                <LoadingButton onClick={fetchData} size={buttonSize ? buttonSize : 'md'} className="d-block w-100" disabled={disabled ? disabled : false}>Show</LoadingButton>
                :
                <Button className="d-block w-100" size={buttonSize ? buttonSize : 'md'} onClick={() => setShown(true)} disabled={disabled ? disabled : false}>Show</Button>
            }

            <Modal
                show={shown}
                onHide={() => setShown(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Images</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="hstack gap-2 mb-3">
                        <Button
                            className="px-3"
                            disabled={images.length == 0}
                            onClick={() => setCurrentImage(Math.max(currentImage - 1, 0))}
                            >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </Button>
                        <div className="flex-fill text-center">{currentImage + 1}/{images.length}</div>
                        <Button
                            className="px-3"
                            disabled={images.length == 0}
                            onClick={() => setCurrentImage(Math.min(currentImage + 1, images.length - 1))}
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </Button>
                    </div>
                    {images.length > 0 ?
                        images.map((image, key) => (
                            <img key={key} src={image} className={`w-100 ${currentImage == key ? '' : 'd-none'}`} />
                        ))
                        :
                        <div className="text-center p-4">
                            No Image Available
                        </div>
                    }
                </Modal.Body>
            </Modal>
        </>
    )
}
