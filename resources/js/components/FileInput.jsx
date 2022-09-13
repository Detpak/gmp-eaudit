import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { Button, Image, ListGroup } from "react-bootstrap";

export default function FileInput({ files, setFiles, className, children, ...rest }) {
    return (
        <div className={className}>
            {files.length > 0 &&
                <ListGroup className="mb-2">
                    {files.map((file, index) => (
                        <ListGroup.Item key={index} className="hstack gap-2">
                            {file.type.includes('image') && <Image src={URL.createObjectURL(file)} style={{ maxWidth: 38, maxHeight: 38, objectFit: 'contain' }} />}
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
        </div>
    );
}
