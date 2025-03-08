
import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { KnowledgeGraph as KnowledgeGraphType } from "@/types/agent"

interface KnowledgeGraphProps {
  data: KnowledgeGraphType;
  onNodeClick?: (nodeId: string) => void;
}

export function KnowledgeGraph({ data, onNodeClick }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return

    const width = 600
    const height = 400

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

    // Create a force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.edges)
        .id((d: any) => d.id)
        .distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))

    // Draw edges
    const edges = svg.append("g")
      .selectAll("line")
      .data(data.edges)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.sqrt(d.strength))

    // Draw nodes
    const nodes = svg.append("g")
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", 5)
      .attr("fill", (d) => {
        switch (d.type) {
          case "skill": return "#3b82f6"
          case "project": return "#10b981"
          case "experience": return "#8b5cf6"
          case "connection": return "#f59e0b"
          default: return "#6b7280"
        }
      })
      .call(drag(simulation) as any)
      .on("click", (event, d) => onNodeClick?.(d.id))

    // Add node labels
    const labels = svg.append("g")
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .text((d) => d.title)
      .attr("font-size", "10px")
      .attr("dx", 8)
      .attr("dy", 3)

    // Update positions on each tick
    simulation.on("tick", () => {
      edges
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      nodes
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y)

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y)
    })

    // Drag behavior
    function drag(simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      }

      function dragged(event: any) {
        event.subject.fx = event.x
        event.subject.fy = event.y
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    }

    return () => {
      simulation.stop()
    }
  }, [data, onNodeClick])

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Knowledge Graph</h3>
        <div className="flex gap-2">
          <Badge variant="secondary">Skills</Badge>
          <Badge variant="secondary">Projects</Badge>
          <Badge variant="secondary">Experience</Badge>
        </div>
      </div>
      <div className="relative w-full aspect-video bg-background">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </Card>
  )
}

