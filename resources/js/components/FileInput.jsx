import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { useState } from "react";
import { useEffect } from "react";
import { Button, Image, ListGroup, Modal } from "react-bootstrap";

export default function FileInput({ files, setFiles, className, children, ...rest }) {
    const [thumbnails, setThumbnails] = useState([]);
    const [showImage, setShowImage] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        setThumbnails(files.map((file) => file.type.includes('image') ? URL.createObjectURL(file) : null));
    }, [files])

    return (
        <div className={className}>
            {files.length > 0 &&
                <ListGroup className="mb-2">
                    {files.map((file, index) => (
                        <ListGroup.Item key={index} className="hstack gap-2">
                            {file &&
                                <Image
                                    role="button"
                                    src={thumbnails[index]}
                                    style={{
                                        width: 38,
                                        height: 38,
                                        maxWidth: 38,
                                        maxHeight: 38,
                                        objectFit: 'contain'
                                    }}
                                    onClick={() => {
                                        setPreviewImage(thumbnails[index]);
                                        setShowImage(true);
                                    }}
                                />
                            }

                            <div className="text-truncate me-auto">{file.name}</div>
                            <Button
                                variant="danger"
                                onClick={() => {
                                    const tmpFiles = files.slice();
                                    tmpFiles.splice(index, 1);
                                    setFiles(tmpFiles);
                                }}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            }

            <label role="button" className="btn btn-primary d-block">
                {children}
                <input
                    multiple
                    type="file"
                    onChange={(ev) => {
                        const fileset = new Set(files.map((data) => data.name));
                        const newFiles = [];

                        for (const file of ev.target.files) {
                            if (!fileset.has(file.name)) {
                                newFiles.push(file);
                            }
                        }

                        setFiles([...newFiles, ...files]);
                    }}
                    style={{ display: "none" }}
                    {...rest}
                />
            </label>
            <Modal
                show={showImage}
                onHide={() => {
                    setShowImage(false);
                }}
                onExited={() => {
                    setPreviewImage(null);
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {previewImage && <Image src={previewImage} className="w-100" />}
                </Modal.Body>
            </Modal>
        </div>
    );
}
