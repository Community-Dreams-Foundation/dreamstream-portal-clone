
import { useState, useMemo } from "react";
import { Task } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  BarChart3,
  PieChart,
  CheckCircle,
  Clock,
  Calendar,
  Tag,
  FileJson,
  Table,
  Share2,
  Network
} from "lucide-react";
import { 
  calculateTaskMetrics, 
  tasksToCSV, 
  tasksToJSON,
  tasksToProjectFormat,
  downloadCSV, 
  downloadJSON,
  calculateTaskTrends,
  activitiesToCSV,
  calculateComplexityDistribution,
  calculateDependencyMetrics
} from "@/utils/exportUtils";
import { fetchRecentActivities } from "@/utils/tasks/activityOperations";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface TaskReportingPanelProps {
  tasks: Task[];
}

export function TaskReportingPanel({ tasks }: TaskReportingPanelProps) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "project">("csv");
  const [activityData, setActivityData] = useState<Array<{
    taskId: string;
    taskTitle: string;
    activity: Task["activities"][0];
  }> | null>(null);
  const [timeframe, setTimeframe] = useState<7 | 14 | 30 | 90>(7);

  const metrics = useMemo(() => calculateTaskMetrics(tasks), [tasks]);
  const trendData = useMemo(() => calculateTaskTrends(tasks, timeframe), [tasks, timeframe]);
  const complexityData = useMemo(() => calculateComplexityDistribution(tasks), [tasks]);
  const dependencyMetrics = useMemo(() => calculateDependencyMetrics(tasks), [tasks]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const statusData = [
    { name: 'Completed', value: metrics.completed },
    { name: 'In Progress', value: metrics.inProgress },
    { name: 'To Do', value: metrics.todo },
    { name: 'Blocked', value: metrics.blocked }
  ];

  const priorityData = [
    { name: 'High', value: metrics.priorityDistribution.high },
    { name: 'Medium', value: metrics.priorityDistribution.medium },
    { name: 'Low', value: metrics.priorityDistribution.low }
  ];
  
  const complexityChartData = [
    { name: 'High', value: complexityData.high.count },
    { name: 'Medium', value: complexityData.medium.count },
    { name: 'Low', value: complexityData.low.count }
  ];

  const handleExportTasks = () => {
    if (!tasks.length) {
      toast({
        variant: "destructive",
        title: "No Tasks to Export",
        description: "There are no tasks available to export."
      });
      return;
    }

    try {
      const date = new Date().toISOString().split('T')[0];
      
      if (exportFormat === "csv") {
        const csvContent = tasksToCSV(tasks);
        downloadCSV(csvContent, `task-export-${date}.csv`);
      } else if (exportFormat === "json") {
        const jsonContent = tasksToJSON(tasks);
        downloadJSON(jsonContent, `task-export-${date}.json`);
      } else if (exportFormat === "project") {
        const projectContent = tasksToProjectFormat(tasks);
        downloadJSON(projectContent, `project-export-${date}.json`);
      }
      
      toast({
        title: "Export Successful",
        description: `${tasks.length} tasks exported to ${exportFormat.toUpperCase()} format`,
      });
    } catch (error) {
      console.error("Error exporting tasks:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export tasks. Please try again."
      });
    }
  };

  const handleExportActivities = async () => {
    if (!currentUser?.uid) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be logged in to export activities."
      });
      return;
    }

    try {
      setLoading(true);
      const activities = await fetchRecentActivities(currentUser.uid, 100);
      
      if (!activities.length) {
        toast({
          variant: "destructive",
          title: "No Activities to Export",
          description: "There are no recent activities available to export."
        });
        setLoading(false);
        return;
      }
      
      // Cache the activities data for later use
      setActivityData(activities);
      
      const csvContent = activitiesToCSV(activities);
      downloadCSV(csvContent, `activity-export-${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Export Successful",
        description: `${activities.length} activities exported to CSV`,
      });
    } catch (error) {
      console.error("Error exporting activities:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export activities. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Task Performance Reporting</CardTitle>
            <CardDescription>View and export task metrics</CardDescription>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Export Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="flex items-center gap-2" onClick={() => {
                  setExportFormat("csv"); 
                  handleExportTasks();
                }}>
                  <Table className="h-4 w-4" /> Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2" onClick={() => {
                  setExportFormat("json");
                  handleExportTasks();
                }}>
                  <FileJson className="h-4 w-4" /> Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2" onClick={() => {
                  setExportFormat("project");
                  handleExportTasks();
                }}>
                  <Share2 className="h-4 w-4" /> Export Project Format
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2" onClick={handleExportActivities} disabled={loading}>
                  <Clock className="h-4 w-4" /> Export Activities
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="complexity">Complexity</TabsTrigger>
            <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium">Completion Rate</h3>
                    </div>
                    <Badge variant="outline" className="bg-green-50">
                      {metrics.completionRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {metrics.completed} of {metrics.total} tasks completed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Estimation Accuracy</h3>
                    </div>
                    <Badge variant="outline" className="bg-blue-50">
                      {metrics.estimationAccuracy.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Avg Est: {metrics.avgEstimatedDuration.toFixed(0)} min | 
                    Avg Actual: {metrics.avgActualDuration.toFixed(0)} min
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-red-500" />
                      <h3 className="font-medium">Overdue Tasks</h3>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {metrics.overdue}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {metrics.overdue} task{metrics.overdue !== 1 ? 's' : ''} past due date
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div> 
                        Completed
                      </span>
                      <span className="text-sm font-medium">{metrics.completed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div> 
                        In Progress
                      </span>
                      <span className="text-sm font-medium">{metrics.inProgress}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div> 
                        To Do
                      </span>
                      <span className="text-sm font-medium">{metrics.todo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> 
                        Blocked
                      </span>
                      <span className="text-sm font-medium">{metrics.blocked}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> 
                        High Priority
                      </span>
                      <span className="text-sm font-medium">{metrics.priorityDistribution.high}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div> 
                        Medium Priority
                      </span>
                      <span className="text-sm font-medium">{metrics.priorityDistribution.medium}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div> 
                        Low Priority
                      </span>
                      <span className="text-sm font-medium">{metrics.priorityDistribution.low}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Task Activity Over Time</CardTitle>
                <Select
                  value={timeframe.toString()}
                  onValueChange={(value) => setTimeframe(parseInt(value) as 7 | 14 | 30 | 90)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="created" name="Tasks Created" fill="#8884d8" />
                    <Bar dataKey="completed" name="Tasks Completed" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Velocity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      name="Tasks Completed" 
                      stroke="#82ca9d" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="complexity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Task Complexity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={complexityChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#ff8042" />
                          <Cell fill="#ffbb28" />
                          <Cell fill="#00c49f" />
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Complexity Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> 
                          High Complexity
                        </span>
                        <span className="text-sm font-medium">
                          {complexityData.high.count} ({complexityData.high.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${complexityData.high.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm flex items-center">
                          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div> 
                          Medium Complexity
                        </span>
                        <span className="text-sm font-medium">
                          {complexityData.medium.count} ({complexityData.medium.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${complexityData.medium.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div> 
                          Low Complexity
                        </span>
                        <span className="text-sm font-medium">
                          {complexityData.low.count} ({complexityData.low.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${complexityData.low.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="dependencies">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Dependency Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Network className="h-5 w-5 text-purple-500" />
                      <h3 className="font-medium">Network Stats</h3>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Total Tasks:</span>
                        <span className="font-medium">{dependencyMetrics.dependencyNetwork.nodes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Connections:</span>
                        <span className="font-medium">{dependencyMetrics.dependencyNetwork.connections}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg. Dependencies:</span>
                        <span className="font-medium">{dependencyMetrics.avgDependencies.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Isolated Tasks:</span>
                        <span className="font-medium">{dependencyMetrics.isolatedTasks}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {dependencyMetrics.criticalTasks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Critical Path Tasks</h3>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-3 gap-4 px-4 py-3 font-medium text-sm bg-slate-50">
                        <div>Task</div>
                        <div>Dependent Tasks</div>
                        <div>Status</div>
                      </div>
                      <div className="divide-y">
                        {dependencyMetrics.criticalTasks.slice(0, 5).map(task => {
                          const taskObj = tasks.find(t => t.id === task.id);
                          return (
                            <div key={task.id} className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                              <div className="truncate">{task.title}</div>
                              <div>{task.dependentCount}</div>
                              <div>
                                {taskObj?.status === "completed" ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-600">Completed</Badge>
                                ) : taskObj?.status === "in-progress" ? (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-600">In Progress</Badge>
                                ) : taskObj?.status === "blocked" ? (
                                  <Badge variant="outline" className="bg-red-50 text-red-600">Blocked</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-600">Todo</Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {dependencyMetrics.mostDependedOn && (
                  <div className="mt-4 p-4 border rounded-md bg-blue-50">
                    <h3 className="text-sm font-medium mb-1">Most Important Task</h3>
                    <p className="text-sm">{dependencyMetrics.mostDependedOn.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dependencyMetrics.mostDependedOn.dependentCount} tasks are blocked by this.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="charts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4">Task Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4">Priority Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#ff8042" />
                        <Cell fill="#ffbb28" />
                        <Cell fill="#00c49f" />
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
