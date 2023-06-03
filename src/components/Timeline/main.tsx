import { Box, Divider, List, Modal, Typography, useTheme } from '@mui/material'
import React, { type RefObject, memo, useCallback, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { MessageFrame } from './MessageFrame'
import { AssociationFrame } from './AssociationFrame'
import type { IuseObjectList } from '../../hooks/useObjectList'
import type { StreamElement, StreamElementDated } from '../../model'
import { useApi } from '../../context/api'
import { InspectorProvider } from '../../context/Inspector'
import { Loading } from '../Loading'
import { Draft } from '../Draft'

export interface TimelineProps {
    streams: string[]
    timeline: IuseObjectList<StreamElementDated>
    scrollParentRef: RefObject<HTMLDivElement>
}

export const Timeline = memo<TimelineProps>((props: TimelineProps): JSX.Element => {
    const api = useApi()
    const [hasMoreData, setHasMoreData] = useState<boolean>(false)
    const theme = useTheme()

    useEffect(() => {
        console.log('load recent!', props.streams)
        let unmounted = false
        props.timeline.clear()
        api?.readStreamRecent(props.streams).then((data: StreamElement[]) => {
            if (unmounted) return
            const current = new Date().getTime()
            const dated = data.map((e) => {
                return { ...e, LastUpdated: current }
            })
            props.timeline.set(dated)
            setHasMoreData(true)
        })
        return () => {
            unmounted = true
        }
    }, [props.streams])

    const loadMore = useCallback(() => {
        if (!api.host) return
        console.log('load more!')
        let unmounted = false
        if (!props.timeline.current[props.timeline.current.length - 1]?.timestamp) {
            return
        }

        api?.readStreamRanged(props.streams, props.timeline.current[props.timeline.current.length - 1].timestamp).then(
            (data: StreamElement[]) => {
                if (unmounted) return
                const idtable = props.timeline.current.map((e) => e.id)
                const newdata = data.filter((e) => !idtable.includes(e.id))
                if (newdata.length > 0) {
                    const current = new Date().getTime()
                    const dated = newdata.map((e) => {
                        return { ...e, LastUpdated: current }
                    })
                    props.timeline.concat(dated)
                } else setHasMoreData(false)
            }
        )

        return () => {
            unmounted = true
        }
    }, [api, props.streams, props.timeline])

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4
    }

    const [open, setOpen] = React.useState(true)
    const handleOpen = (): void => {
        setOpen(true)
    }
    const handleClose = (): void => {
        setOpen(false)
    }

    return (
        <>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Draft currentStreams={''} />
                </Box>
            </Modal>
            <InspectorProvider>
                <List sx={{ flex: 1, width: '100%' }}>
                    <InfiniteScroll
                        loadMore={() => {
                            loadMore()
                        }}
                        hasMore={hasMoreData}
                        loader={<Loading key={0} message="Loading..." color={theme.palette.text.primary} />}
                        useWindow={false}
                        getScrollParent={() => props.scrollParentRef.current}
                    >
                        {props.timeline.current.map((e) => (
                            <React.Fragment key={e.id}>
                                {e.type === 'message' && <MessageFrame message={e} lastUpdated={e.LastUpdated} />}
                                {e.type === 'association' && (
                                    <AssociationFrame association={e} lastUpdated={e.LastUpdated} />
                                )}
                                {e.type !== 'message' && e.type !== 'association' && (
                                    <Typography>Unknown message type: {e.type}</Typography>
                                )}
                                <Divider variant="inset" component="li" sx={{ margin: '0 5px' }} />
                            </React.Fragment>
                        ))}
                    </InfiniteScroll>
                </List>
            </InspectorProvider>
        </>
    )
})

Timeline.displayName = 'Timeline'
