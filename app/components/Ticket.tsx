'use client'

import { useCallback, useEffect, useState } from "react"
import { Ticket, TicketCategory, ContentType } from "../lib/types"
import { RootState, useAppSelector } from "../lib/local/redux/store"
import { createTicket, deleteTicket, getUserTickets, listenToTicketChange, replicateTicket, updateTicket } from "../lib/dataSource/contentDataSource"
import { uploadFile } from "../lib/dataSource/contentDataSource"
import { showToast } from "../lib/dataSource/toast"
import { Plus, Trash2, Copy, Edit, Save, X, Loader2, Upload, Image, Calendar, Users, FileText, MoreVertical } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import TicketCard from "./ticketCard"

interface UploadTask {
  id: string
  progress: number
  isPaused: boolean
  isRunning: boolean
  isCanceled: boolean
}

export const TicketPage = () => {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isReplicateDialogOpen, setIsReplicateDialogOpen] = useState(false)
    const [replicateCount, setReplicateCount] = useState(1)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
    const [uploadTasks, setUploadTasks] = useState<{ [key: string]: UploadTask }>({})
    
    const { user } = useAppSelector((state: RootState) => state.auth)
    
    const [newTicket, setNewTicket] = useState<Ticket>({
        id: ``,
        name: "",
        description: "",
        categories: [],
        parentId: "",
        creator: user,
        ticketPoster: "",
        count : {
            available : 0,
            purchased : 0,
            total : 0
        },
        isPurchased : false,
        isPoster : true,
        eventStartDate : new Date()
    })

    const onGetUserTickets = useCallback(async () => {
        setLoading(true)
        try {
            const _tickets = await getUserTickets(user)
            setTickets(_tickets.map(c=>({...c,eventStartDate : new Date()})))
        } catch (error) {
            showToast("Failed to load tickets")
        } finally {
            setLoading(false)
        }
    }, [user])

    const handleFileUpload = useCallback(async (file: File, ticketId: string) => {
        const taskId = `upload-${ticketId}-${Date.now()}`
        
        const task: UploadTask = {
            id: taskId,
            progress: 0,
            isPaused: false,
            isRunning: true,
            isCanceled: false
        }

        setUploadTasks(prev => ({ ...prev, [ticketId]: task }))

        try {
            await uploadFile(
                file,
                (progress) => {
                    setUploadProgress(prev => ({ ...prev, [ticketId]: progress }))
                },
                (isPaused) => {
                    setUploadTasks(prev => ({
                        ...prev,
                        [ticketId]: { ...prev[ticketId], isPaused }
                    }))
                },
                (isRunning) => {
                    setUploadTasks(prev => ({
                        ...prev,
                        [ticketId]: { ...prev[ticketId], isRunning }
                    }))
                },
                (isCanceled) => {
                    setUploadTasks(prev => ({
                        ...prev,
                        [ticketId]: { ...prev[ticketId], isCanceled }
                    }))
                },
                (task) => {},
                async (downloadUri) => {
                    if (downloadUri) {
                        if (editingTicket?.id === ticketId) {
                            await onUpdateTicket({...editingTicket, ticketPoster: downloadUri})
                            setEditingTicket(prev => prev ? { ...prev, ticketPoster: downloadUri } : null)
                        }
                        setTickets(prev => prev.map(ticket => 
                            ticket.id === ticketId 
                                ? { ...ticket, ticketPoster: downloadUri }
                                : ticket
                        ))
                        showToast("Ticket poster uploaded successfully")
                    }
                    setUploadTasks(prev => {
                        const newTasks = { ...prev }
                        delete newTasks[ticketId]
                        return newTasks
                    })
                    setUploadProgress(prev => {
                        const newProgress = { ...prev }
                        delete newProgress[ticketId]
                        return newProgress
                    })
                },
                ticketId,
                file.name.split('.').pop() || 'jpg',
                ContentType.PODCAST
            )
        } catch (error) {
            showToast("Failed to upload ticket poster")
            setUploadTasks(prev => {
                const newTasks = { ...prev }
                delete newTasks[ticketId]
                return newTasks
            })
            setUploadProgress(prev => {
                const newProgress = { ...prev }
                delete newProgress[ticketId]
                return newProgress
            })
        }
    }, [editingTicket])

    const onUpdateTicket = useCallback(async (ticket: Ticket) => {
        setActionLoading(`update-${ticket.id}`)
        try {
            await updateTicket(ticket, user, () => {
                showToast("Ticket updated successfully")
                setEditingTicket(null)
                // Real-time updates handled by listenToTicketChange
            }, () => {
                showToast("Failed to update ticket")
            })
        } finally {
            setActionLoading(null)
        }
    }, [user])

    const onCreateNewTicket = useCallback(async (ticket: Ticket) => {
        setActionLoading('create')
        try {
            await createTicket(ticket, () => {
                showToast("Ticket created successfully")
                setIsCreateDialogOpen(false)
                setNewTicket({
                    id: ``,
                    name: "",
                    description: "",
                    categories: [],
                    parentId: "",
                    creator: user,
                    ticketPoster: "",
                    isPoster : true,
                        count : {
                            available : 0,
                            purchased : 0,
                            total : 0
                        },
                        isPurchased : false,
                        eventStartDate : new Date()

                })
            }, () => {
                showToast("Failed to create ticket")
            })
        } finally {
            setActionLoading(null)
        }
    }, [user])

    const onDeleteTicket = useCallback(async (ticket: Ticket) => {
        setActionLoading(`delete-${ticket.id}`)
        try {
            await deleteTicket(ticket, user, () => {
                showToast("Ticket deleted successfully")
                setTickets(prev => prev.filter(t => t.id !== ticket.id))
            }, () => {
                showToast("Failed to delete ticket")
            })
        } finally {
            setActionLoading(null)
        }
    }, [user])

    const onReplicateTickets = useCallback(async (ticket: Ticket, count: number) => {
        setActionLoading(`replicate-${ticket.id}`)
        try {
            await replicateTicket(ticket, user, count, () => {
                showToast(`${count} ticket copies created`)
                setIsReplicateDialogOpen(false)
                setSelectedTicket(null)
                setReplicateCount(1)
                // Real-time updates handled by listenToTicketChange
            }, () => {
                showToast("Failed to replicate ticket")
            })
        } finally {
            setActionLoading(null)
        }
    }, [user])

    const handleCreateTicket = useCallback(() => {
        if (!newTicket.name.trim()) {
            showToast("Please enter a ticket name")
            return
        }
        onCreateNewTicket(newTicket)
    }, [newTicket, onCreateNewTicket])

    const handleAddCategory = (ticket: Ticket) => {
        const newCategory: TicketCategory = {
            name: "General Admission",
            price: 0
        }
        const updatedTicket = {
            ...ticket,
            categories: [...ticket.categories, newCategory]
        }
        if (editingTicket?.id === ticket.id) {
            setEditingTicket(updatedTicket)
        } else {
            onUpdateTicket(updatedTicket)
        }
    }

    const handleRemoveCategory = (ticket: Ticket, categoryIndex: number) => {
        const updatedCategories = ticket.categories.filter((_, index) => index !== categoryIndex)
        const updatedTicket = {
            ...ticket,
            categories: updatedCategories
        }
        if (editingTicket?.id === ticket.id) {
            setEditingTicket(updatedTicket)
        } else {
            onUpdateTicket(updatedTicket)
        }
    }

    const handleUpdateCategory = (ticket: Ticket, categoryIndex: number, field: keyof TicketCategory, value: any) => {
        const updatedCategories = ticket.categories.map((category, index) => {
            if (index === categoryIndex) {
                return { ...category, [field]: value }
            }
            return category
        })
        const updatedTicket = {
            ...ticket,
            categories: updatedCategories
        }
        setEditingTicket(updatedTicket)
    }

    const handleSaveTicket = (ticket: Ticket) => {
        if (!ticket.name.trim()) {
            showToast("Please enter a ticket name")
            return
        }
        onUpdateTicket(ticket)
    }



    // const handleListenToTicketChanges = useCallback(async () => {
    //     if (tickets.length > 0) {
    //         await Promise.all(tickets.map(ticket => listenToTicketChanges(ticket)))
    //     }
    // }, [tickets, listenToTicketChanges])

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, ticketId: string) => {
        const file = event.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                showToast("Please select an image file")
                return
            }
            if (file.size > 20 * 1024 * 1024) { 
                showToast("File size must be less than 20MB")
                return
            }
            handleFileUpload(file, ticketId)
        }
    }

    const handleReplicateCountChange = (value: string) => {
        const count = parseInt(value)
        if (!isNaN(count) && count >= 1 && count <= 1000000) {
            setReplicateCount(count)
        }
    }

    useEffect(() => {
        onGetUserTickets()
    }, [onGetUserTickets])


    const LoadingSkeleton = () => (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse border-0 shadow-sm rounded-xl overflow-hidden">
                    <div className="h-48 bg-muted" />
                    <CardHeader className="space-y-3 p-6">
                        <Skeleton className="h-6 w-3/4 rounded" />
                        <Skeleton className="h-4 w-full rounded" />
                    </CardHeader>
                    <CardContent className="space-y-3 p-6 pt-0">
                        <Skeleton className="h-20 w-full rounded" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-full rounded" />
                            <Skeleton className="h-8 w-full rounded" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )

    return (
        <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Event Tickets</h1>
                        <p className="text-muted-foreground">
                            Manage and organize your event tickets efficiently
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Create Ticket
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Ticket</DialogTitle>
                                <DialogDescription>
                                    Add a new event ticket with categories and pricing information.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ticket-name">Ticket Name</Label>
                                    <Input
                                        value={newTicket.name}
                                        onChange={e => setNewTicket(prev => ({ ...prev, name: e.target.value }))}
                                        id="ticket-name"
                                        placeholder="Enter ticket name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ticket-description">Description</Label>
                                    <Textarea
                                        value={newTicket.description}
                                        onChange={e => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                                        id="ticket-description"
                                        placeholder="Enter ticket description"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsCreateDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateTicket}
                                    disabled={actionLoading === 'create'}
                                >
                                    {actionLoading === 'create' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Create Ticket
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { icon: FileText, title: "Total Tickets", value: tickets.length },
                        { icon: Users, title: "Categories", value: tickets.reduce((acc, ticket) => acc + ticket.categories.length, 0) },
                        { icon: Copy, title: "Replicated", value: tickets.filter(t => t.parentId).length }
                    ].map((stat, index) => (
                        <Card key={index} className="border-0 shadow-sm">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-primary/10">
                                    <stat.icon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tickets Grid */}
                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <Tabs defaultValue="all" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3 max-w-md">
                            <TabsTrigger value="all">All Tickets</TabsTrigger>
                            <TabsTrigger value="with-categories">With Categories</TabsTrigger>
                            <TabsTrigger value="no-categories">No Categories</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {tickets.map((ticket) => (
                                    <TicketCard actionLoading={actionLoading} editingTicket={editingTicket} handleAddCategory={handleAddCategory} handleFileSelect={handleFileSelect} handleRemoveCategory={handleRemoveCategory} handleSaveTicket={handleSaveTicket} handleUpdateCategory={handleUpdateCategory} onDeleteTicket={onDeleteTicket} setEditingTicket={setEditingTicket} setIsReplicateDialogOpen={setIsReplicateDialogOpen} setSelectedTicket={setSelectedTicket} ticket={ticket} uploadProgress={uploadProgress} uploadTasks={uploadTasks} key={ticket.id} setTicket={x => setTickets(prev => (prev.map(y => y.id == x.id ? x : y)))} user={user}/>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}

                {tickets.length === 0 && !loading && (
                    <Card className="text-center py-16 border-0 shadow-sm">
                        <CardContent className="space-y-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                <Calendar className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">No tickets yet</h3>
                                <p className="text-muted-foreground mt-2">
                                    Get started by creating your first event ticket.
                                </p>
                            </div>
                            <Button 
                                onClick={() => setIsCreateDialogOpen(true)}
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Create Ticket
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Replicate Dialog */}
                <Dialog open={isReplicateDialogOpen} onOpenChange={setIsReplicateDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Replicate Ticket</DialogTitle>
                            <DialogDescription>
                                Create multiple copies of this ticket. Enter the number of copies you want to create.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="replicate-count">Number of copies</Label>
                                <Input
                                    id="replicate-count"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={replicateCount}
                                    onChange={(e) => handleReplicateCountChange(e.target.value)}
                                    placeholder="Enter number of copies"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter a number 
                                </p>
                            </div>
                            {selectedTicket && (
                                <div className="p-3 border rounded-lg bg-muted/20">
                                    <p className="text-sm font-medium">Selected Ticket:</p>
                                    <p className="text-sm text-muted-foreground truncate">{selectedTicket.name}</p>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setIsReplicateDialogOpen(false)
                                    setSelectedTicket(null)
                                    setReplicateCount(1)
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => selectedTicket && onReplicateTickets(selectedTicket, replicateCount)}
                                disabled={actionLoading === `replicate-${selectedTicket?.id}` || replicateCount < 1 || replicateCount > 100000}
                                className="gap-2"
                            >
                                {actionLoading === `replicate-${selectedTicket?.id}` && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                <Copy className="w-4 h-4" />
                                Create {replicateCount} {replicateCount === 1 ? 'Copy' : 'Copies'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}