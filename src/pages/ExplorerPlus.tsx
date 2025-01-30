import { Helmet } from 'react-helmet-async'
import {
    Avatar,
    Box,
    Card,
    CardMedia,
    Divider,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useState } from 'react'
import { CCWallpaper } from '../components/ui/CCWallpaper'
import { WatchButton } from '../components/WatchButton'
import FindInPageIcon from '@mui/icons-material/FindInPage'
import { CCIconButton } from '../components/ui/CCIconButton'
import { useTimelineDrawer } from '../context/TimelineDrawer'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useUserDrawer } from '../context/UserDrawer'

export interface Domain {
    fqdn: string
    ccid: string
    csid: string
    tag: string
    score: number
    meta?: DomainMeta
    isScoreFixed: boolean
    dimension: string
    cdate: string
    mdate: string
    lastScraped: string
}

export interface DomainMeta {
    nickname: string
    description: string
    logo: string
    wordmark: string
    themeColor: string
    maintainerName: string
    maintainerEmail: string
    registration: string
    version: string
    buildInfo: {
        BuildTime: string
        BuildMachine: string
        GoVersion: string
    }
    captchaSiteKey: string
    vapidKey: string
}

export interface Timeline {
    id: string
    indexable: boolean
    owner: string
    author: string
    schema: string
    policy: string
    policyParams: string
    document?: string
    _parsedDocument: {
        id: string
        owner: string
        signer: string
        type: string
        schema: string
        body: {
            name: string
            shortname: string
            description: string
            banner: string
        }
        meta: {
            client: string
        }
        signAt: string
        indexable: boolean
        policy: string
        keyID: string
    }
    signature: string
    cdate: string
    mdate: string
    domainFQDN?: string
}

export interface User {
    id: string
    author: string
    schema: string
    document?: string
    _parsedDocument: {
        semanticID: string
        signer: string
        type: string
        schema: string
        body: {
            username: string
            description: string
            avatar: string
            banner: string
            badges: Array<{
                badgeId: string
                seriesId: string
            }>
        }
        meta: {
            client: string
        }
        signedAt: string
        KeyID: string
    }
    signature: string
    cdate: string
    mdate: string
    fqdn?: string
}

export function ExplorerPlusPage(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'pages.explore' })
    const theme = useTheme()
    const { open } = useTimelineDrawer()
    const u = useUserDrawer()

    const EXPLORER_HOST = 'https://explorer.concrnt.world'
    // const EXPLORER_HOST = 'https://c.kokopi.me'

    const [timelines, setTimelines] = useState<Timeline[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [domains, setDomains] = useState<Domain[]>([])
    const [stat, setStat] = useState<{ domains: number; timelines: number; users: number }>({
        domains: 0,
        timelines: 0,
        users: 0
    })

    const [query, setQuery] = useState('')
    const [userQuery, setUserQuery] = useState('')

    const [textArea, setTextArea] = useState('')
    const [userTextArea, setUserTextArea] = useState('')

    useEffect(() => {
        fetch(EXPLORER_HOST + '/stat').then(async (result) => {
            setStat(await result.json())
        })
    }, [])

    useEffect(() => {
        // fetch
        if (query === '') {
            fetch(EXPLORER_HOST + '/timeline?random=true&limit=30').then(async (result) => {
                setTimelines(await result.json())
            })
        } else {
            fetch(EXPLORER_HOST + '/timeline?limit=30&q=' + query).then(async (result) => {
                setTimelines(await result.json())
            })
        }

        fetch(EXPLORER_HOST + '/domain').then(async (result) => {
            setDomains(await result.json())
        })
    }, [query])

    useEffect(() => {
        if (userQuery === '') {
            fetch(EXPLORER_HOST + '/user?random=true&limit=30').then(async (result) => {
                setUsers(await result.json())
            })
        } else {
            fetch(EXPLORER_HOST + '/user?limit=30&q=' + userQuery).then(async (result) => {
                setUsers(await result.json())
            })
        }
    }, [userQuery])

    const getDomainFromFQDN = useCallback(
        (fqdn: string | undefined) => {
            return domains.filter((d) => d.fqdn === fqdn)[0]
        },
        [domains]
    )

    const [tabValue, setTabValue] = useState<'timelines' | 'users'>('timelines')
    useEffect(() => {
        const url = new URL(window.location.href)
        const tab = url.searchParams.get('tab')
        if (tab === 'users') {
            setTabValue('users')
        }
    }, [])

    return (
        <>
            <Helmet>
                <title>ExplorerPlus - Concrnt</title>
            </Helmet>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    paddingX: 1,
                    paddingTop: 1,
                    background: theme.palette.background.paper,
                    minHeight: '100%',
                    overflowY: 'scroll'
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                    <Typography variant="h2">new {t('title')}</Typography>
                    <Divider sx={{ mb: 1 }} />

                    <Typography variant={'caption'}>
                        現在 {stat.domains} のアクティブなドメイン&nbsp;
                        {stat.timelines} のアクティブなタイムライン&nbsp;
                        {stat.users} 人のユーザ
                    </Typography>

                    <Tabs
                        value={tabValue}
                        onChange={(_, v) => {
                            setTabValue(v)
                            // tabクエリをつける
                            const url = new URL(window.location.href)
                            url.searchParams.set('tab', v)
                            window.history.pushState({}, '', url.toString())
                        }}
                    >
                        <Tab value={'timelines'} label={'タイムライン'} />
                        <Tab value={'users'} label={'ユーザー'} />
                    </Tabs>

                    {tabValue === 'timelines' && (
                        <>
                            <TextField
                                value={textArea}
                                onChange={(e) => {
                                    setTextArea(e.target.value)
                                    setQuery(e.target.value)
                                }}
                                label={'ここに入力してタイムラインを検索'}
                                variant={'outlined'}
                                fullWidth
                                sx={{ marginY: 1 }}
                            />

                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(384px, 1fr))',
                                    gap: 1
                                }}
                            >
                                {timelines.map((t) => {
                                    return (
                                        <Card key={t.id} sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                            <CardMedia sx={{ height: '100px', width: '100px' }}>
                                                <CCWallpaper
                                                    sx={{
                                                        height: '100px',
                                                        width: '100px'
                                                    }}
                                                    override={t._parsedDocument.body.banner}
                                                />
                                            </CardMedia>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    paddingY: 0.3,
                                                    paddingX: 0.5,
                                                    height: '100%',
                                                    flex: 1,
                                                    minWidth: 0
                                                }}
                                            >
                                                <Box flexGrow={1}>
                                                    <Typography variant={'h4'}>
                                                        {t._parsedDocument.body.name}
                                                    </Typography>
                                                    <Typography
                                                        variant={'caption'}
                                                        sx={{
                                                            textOverflow: 'ellipsis',
                                                            overflow: 'hidden',
                                                            display: 'block',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {t._parsedDocument.body.description}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 1,
                                                        alignItems: 'center',
                                                        marginTop: 'auto'
                                                    }}
                                                >
                                                    <Avatar
                                                        src={getDomainFromFQDN(t.domainFQDN)?.meta?.logo}
                                                        sx={{ height: 18, width: 18 }}
                                                    />
                                                    <Typography variant="caption">
                                                        {getDomainFromFQDN(t.domainFQDN)?.meta?.nickname}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 1, marginLeft: 'auto' }}>
                                                        <WatchButton minimal small timelineID={t.id} />
                                                        <Tooltip title={'みてみる'} placement={'top'} arrow>
                                                            <CCIconButton
                                                                size={'small'}
                                                                onClick={() => {
                                                                    open(t.id)
                                                                }}
                                                            >
                                                                <FindInPageIcon />
                                                            </CCIconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Card>
                                    )
                                })}
                            </Box>
                        </>
                    )}
                    {tabValue === 'users' && (
                        <>
                            <TextField
                                value={userTextArea}
                                onChange={(e) => {
                                    setUserTextArea(e.target.value)
                                    setUserQuery(e.target.value)
                                }}
                                label={'ここに入力してユーザを検索'}
                                variant={'outlined'}
                                fullWidth
                                sx={{ marginY: 1 }}
                            />

                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(384px, 1fr))',
                                    gap: 1
                                }}
                            >
                                {users.map((t) => {
                                    return (
                                        <Card key={t.id} sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                            <CardMedia sx={{ height: '100px', width: '100px' }}>
                                                <CCWallpaper
                                                    sx={{
                                                        height: '100px',
                                                        width: '100px'
                                                    }}
                                                    override={t._parsedDocument.body.avatar}
                                                />
                                            </CardMedia>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    paddingY: 0.3,
                                                    paddingX: 0.5,
                                                    height: '100%',
                                                    flex: 1,
                                                    minWidth: 0
                                                }}
                                            >
                                                <Box flexGrow={1}>
                                                    <Typography variant={'h4'}>
                                                        {t._parsedDocument.body.username}
                                                    </Typography>
                                                    <Typography
                                                        variant={'caption'}
                                                        sx={{
                                                            textOverflow: 'ellipsis',
                                                            overflow: 'hidden',
                                                            display: 'block',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {t._parsedDocument.body.description}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 1,
                                                        alignItems: 'center',
                                                        marginTop: 'auto'
                                                    }}
                                                >
                                                    <Avatar
                                                        src={getDomainFromFQDN(t.fqdn)?.meta?.logo}
                                                        sx={{ height: 18, width: 18 }}
                                                    />
                                                    <Typography variant="caption">
                                                        {getDomainFromFQDN(t.fqdn)?.meta?.nickname}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 1, marginLeft: 'auto' }}>
                                                        <WatchButton
                                                            minimal
                                                            small
                                                            timelineID={'world.concrnt.t-home@' + t.author}
                                                        />
                                                        <Tooltip title={'みてみる'} placement={'top'} arrow>
                                                            <CCIconButton
                                                                size={'small'}
                                                                onClick={() => {
                                                                    u.open(t.author)
                                                                }}
                                                            >
                                                                <FindInPageIcon />
                                                            </CCIconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Card>
                                    )
                                })}
                            </Box>
                        </>
                    )}
                </Box>
            </Box>
        </>
    )
}
