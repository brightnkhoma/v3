"use client"
import { useCallback, useEffect, useState } from "react"
import { Ticket } from "../lib/types"
import { getTickets } from "../lib/dataSource/contentDataSource"
import TicketListing from "./ticketSnippet"
import { useRouter } from "next/navigation"


export const TicketView = ()=>{
    const [tickets, setTickets] = useState<Ticket[]>([])
    const router = useRouter()
    const onTicketClick = useCallback((ticket : Ticket)=>{
        router.push(`/tickets/${ticket.id}`)
    },[])


    const onGetTickets = useCallback(async()=>{
        const _tickets = await getTickets()
        setTickets(_tickets)
    },[])

    useEffect(()=>{
        onGetTickets()
    },[])
    return(
        <div className="flex w-full">
           <TicketListing tickets={tickets} onTicketClick={onTicketClick}/>
        </div>
    )
}