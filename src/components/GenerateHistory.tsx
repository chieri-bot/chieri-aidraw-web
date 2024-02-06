import React, {useState} from 'react';
import {Grid, Button, Box, CloseButton, ScrollArea, Flex, Group} from '@mantine/core';
import {SaveImageBlob} from "../utils/models.ts";
import {backgroundFullImgStyle, maxWidth} from "../styles.ts";
import * as JSZip from "jszip";
import {downloadFile, showErrorMessage} from "../utils/utils.ts";

interface GenerateHistoryProps {
    historyFiles: SaveImageBlob[],
    deleteImage: (index: number) => any
    moveImageToFirst: (index: number) => any
    onClose: () => any
}

const GenerateHistory: React.FC<GenerateHistoryProps> = ({ historyFiles, deleteImage, moveImageToFirst, onClose }) => {
    const [zipping, setZipping] = useState(false)

    const handleDelete = (index: number) => {
        deleteImage(index)
    }

    const handleClickImg = (index: number) => {
        moveImageToFirst(index)
        onClose()
    }

    const handleDownloadAll = () => {
        setZipping(true)
        const zip = new JSZip();

        historyFiles.forEach((file, index) => {
            zip.file(`seed:${file.seed}-index:${index + 1}.png`, file.data);
        });

        zip.generateAsync({ type: 'blob' })
            .then((content) => {
                const url = URL.createObjectURL(content);
                downloadFile(url, `aidraw-${new Date().getTime()}.zip`)
                URL.revokeObjectURL(url);
            })
            .catch((e) => showErrorMessage(e.toString(), "打包失败"))
            .finally(() => setZipping(false))
    }

    return (
        <Flex gap="md" justify="center" align="center" direction="column" wrap="wrap">
            <ScrollArea style={maxWidth}>
                <Box mah="calc(70vh - 36px)" w="95%">
                    <Grid>
                        {historyFiles.map((file, index) => (
                            <Grid.Col span="content" key={index} style={{ position: 'relative'}}>
                                <Box style={{width: "6.5em", height: "6.5em", backgroundImage: `url(${file.url})`, ...backgroundFullImgStyle}}
                                     onClick={() => handleClickImg(index)}>
                                    <CloseButton
                                        style={{
                                            position: 'relative',
                                            left: '5em',
                                            zIndex: 1,
                                            background: 'transparent',
                                            color: 'black',
                                        }}
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            handleDelete(index)
                                        }}
                                        size="1.5em"
                                    />
                                </Box>
                            </Grid.Col>
                        ))}

                    </Grid>
                </Box>
            </ScrollArea>

            <Group justify="center" style={{height: "36px", width: "100%"}}>
                <Button color="red" onClick={() => handleDelete(-1145)} disabled={historyFiles.length == 0}>清空历史</Button>
                <Button onClick={() => handleDownloadAll()} loading={zipping}
                        disabled={zipping || (historyFiles.length == 0)}>下载 ZIP</Button>
            </Group>

        </Flex>
    );
};

export default GenerateHistory;
