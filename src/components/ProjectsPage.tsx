
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ProjectDetailsModal from "./ProjectDetailsModal";
import ProjectFilterDropdown from "./ProjectFilterDropdown";
import ProjectCreateModal from "./ProjectCreateModal";
import { toast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  allocated_hours: number;
  assigned_to: string;
  assigned_by: string;
}

const ProjectsPage = () => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let query = supabase.from("projects").select("*");
      if (!isAdmin && profile?.id) {
        query = query.eq("assigned_to", profile.id);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setProjects(data || []);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to fetch projects", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "on_hold": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleOpenDetails = (project: Project) => {
    setSelectedProject(project);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedProject(null);
  };

  const handleFilterChange = (status: string | null) => {
    setFilterStatus(status);
  };

  const handleCreateProject = () => {
    setCreateModalOpen(true);
  };

  const handleProjectCreated = () => {
    fetchProjects();
  };

  const filteredProjects = projects.filter((project) => {
    const matchStatus = filterStatus ? project.status === filterStatus : true;
    const matchSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">{
            isAdmin ? "All Projects" : "My Projects"
          }</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse shadow rounded-lg">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h2 className="text-3xl font-bold tracking-tight">{isAdmin ? "All Projects" : "My Projects"}</h2>
        {isAdmin && (
          <Button onClick={handleCreateProject} className="hover:scale-105 transition-transform">
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div>
          <ProjectFilterDropdown status={filterStatus} onChange={handleFilterChange} />
        </div>
      </div>
      {filteredProjects.length === 0 ? (
        <Card className="shadow-md rounded-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? "Try adjusting your search terms."
                  : isAdmin
                  ? "Create your first project to get started."
                  : "No projects have been assigned to you yet."}
              </p>
              {isAdmin && !searchTerm && (
                <Button onClick={handleCreateProject} className="hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow rounded-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description || "No description available"}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    {project.allocated_hours} hours allocated
                  </div>
                  {isAdmin && (
                    <div className="flex items-center text-gray-500">
                      <User className="w-4 h-4 mr-2" />
                      Assigned to employee
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleOpenDetails(project)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        open={detailsOpen}
        onClose={handleCloseDetails}
        isAdmin={isAdmin}
      />
      {isAdmin && (
        <ProjectCreateModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
