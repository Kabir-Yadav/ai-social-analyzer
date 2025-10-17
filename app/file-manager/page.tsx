"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/narrative";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Upload,
  Star,
  MoreVertical,
  Search,
  ArrowUpDown,
  Calendar,
  Filter,
  List,
  Grid3X3,
  Folder,
  File,
  Archive,
  FileSpreadsheet,
  Play,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  size: string; // human readable
  bytes: number;
  type: string; // image|video|pdf|archive|spreadsheet|document|other
  modified: string; // ISO date
  url: string;
}

const getFileIcon = (type: string) => {
  switch (type) {
    case "archive":
      return <Archive className="h-5 w-5 text-amber-600" />;
    case "spreadsheet":
      return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
    case "image":
      return <ImageIcon className="h-5 w-5 text-blue-600" />;
    case "video":
      return <Play className="h-5 w-5 text-red-600" />;
    case "pdf":
      return <File className="h-5 w-5 text-rose-600" />;
    case "document":
      return <File className="h-5 w-5 text-muted-foreground" />;
    default:
      return <File className="h-5 w-5 text-muted-foreground/70" />;
  }
};

export default function FileManagerPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadFiles = async () => {
    try {
      const res = await fetch("/api/files", { cache: "no-store" });
      const data = await res.json();
      setFiles(Array.isArray(data.files) ? data.files : []);
      setSelectedFiles([]);
    } catch (e) {
      // no-op
    }
  };

  useEffect(() => {
    loadFiles();
    try {
      const raw = localStorage.getItem("fileManager.favorites");
      if (raw) setFavorites(JSON.parse(raw));
    } catch {}
  }, []);

  const saveFavorites = (next: string[]) => {
    setFavorites(next);
    try {
      localStorage.setItem("fileManager.favorites", JSON.stringify(next));
    } catch {}
  };

  const toggleFavorite = (fileId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(fileId);
      const next = exists
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId];
      try {
        localStorage.setItem("fileManager.favorites", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map((file) => file.id));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    const form = new FormData();
    Array.from(list).forEach((f) => form.append("files", f));
    setIsUploading(true);
    try {
      await fetch("/api/files", { method: "POST", body: form });
      await loadFiles();
    } catch (err) {
      // noop
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    try {
      await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: selectedFiles }),
      });
      await loadFiles();
      // remove from favorites if any were deleted
      saveFavorites(favorites.filter((id) => !selectedFiles.includes(id)));
    } catch (err) {
      // noop
    }
  };

  const handleDeleteSingle = async (fileId: string) => {
    try {
      await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: [fileId] }),
      });
      await loadFiles();
      saveFavorites(favorites.filter((id) => id !== fileId));
    } catch {}
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteFiles = files.filter((file) => favorites.includes(file.id));

  return (
    <div className="flex overflow-x-hidden min-h-dvh bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 h-screen ml-64">
        {/* Persistent Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-[1600px] mx-auto px-8">
            <div className="flex items-center justify-between py-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">
                  File Manager
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage and organize your files
                </p>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleUploadChange}
                />
                <Button
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-600 dark:hover:bg-orange-700 px-6 py-2.5 rounded-lg shadow-sm font-medium transition-all"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Files"}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main File Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Favorites Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Favorites
                  </h2>
                  <button className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors">
                    View all →
                  </button>
                </div>
                <div className="flex flex-wrap gap-4">
                  {favoriteFiles.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No favorites yet
                    </div>
                  ) : (
                    favoriteFiles.map((file) => (
                      <Card
                        key={file.id}
                        className="border border-border shadow-sm bg-card relative"
                        style={{ maxWidth: "300px" }}
                      >
                        <CardContent className="p-5">
                          <div className="flex justify-between">
                            <div className="flex flex-col gap-4">
                              <div
                                className={`p-3 rounded-lg ${
                                  file.type === "archive"
                                    ? "bg-amber-50"
                                    : "bg-emerald-50"
                                }`}
                                style={{ width: "fit-content" }}
                              >
                                {getFileIcon(file.type)}
                              </div>
                              <div>
                                <div className="font-medium text-foreground text-sm mb-0.5 truncate max-w-[220px]">
                                  {file.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {file.size}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 absolute top-4 right-4">
                              <button
                                aria-label="Toggle favorite"
                                className="p-1 rounded hover:bg-muted/50 transition-colors text-amber-500"
                                onClick={() => toggleFavorite(file.id)}
                              >
                                <Star className="h-5 w-5 fill-amber-500" />
                              </button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    aria-label="More actions"
                                    className="p-1.5 hover:bg-muted/50 rounded transition-colors text-muted-foreground"
                                  >
                                    <MoreVertical className="h-5 w-5" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-popover border-border"
                                >
                                  <DropdownMenuItem
                                    onClick={() =>
                                      window.open(file.url, "_blank")
                                    }
                                  >
                                    <ExternalLink className="h-4 w-4" /> View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => handleDeleteSingle(file.id)}
                                  >
                                    <Trash2 className="h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Files */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Recent Files
                </h2>
                <div className="space-y-2">
                  {files.slice(0, 3).map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-orange-400 hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => window.open(file.url, "_blank")}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2.5 rounded-lg ${
                            file.type === "archive"
                              ? "bg-amber-50 dark:bg-amber-900/20"
                              : "bg-emerald-50 dark:bg-emerald-900/20"
                          }`}
                        >
                          {getFileIcon(file.type)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-sm mb-0.5">
                            {file.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {file.size} ·{" "}
                            {new Date(file.modified).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <ExternalLink className="h-5 w-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search and Controls */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 bg-input border-border focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>
                <Button
                  variant="destructive"
                  disabled={selectedFiles.length === 0}
                  onClick={handleBulkDelete}
                  className="h-11"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Selected
                </Button>
                <Select>
                  <SelectTrigger className="w-[140px] h-11 bg-input border-border">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[140px] h-11 bg-input border-border">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="zip">ZIP files</SelectItem>
                    <SelectItem value="csv">CSV files</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File Table */}
              <Card className="border border-border shadow-sm py-0 bg-card overflow-hidden">
                <CardContent
                  className={`${
                    filteredFiles.length > 0 ? "pb-0" : "pb-6"
                  } px-0`}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="px-6 py-4 text-left w-12">
                            <Checkbox
                              checked={selectedFiles.length === files.length}
                              onCheckedChange={handleSelectAll}
                              className="border-border"
                            />
                          </th>
                          <th className="px-6 py-4 text-left font-semibold text-foreground text-sm">
                            <div className="flex items-center gap-2">
                              Name
                              <ArrowUpDown className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left font-semibold text-foreground text-sm">
                            Size
                          </th>
                          <th className="px-6 py-4 text-left font-semibold text-foreground text-sm">
                            Type
                          </th>
                          <th className="px-6 py-4 text-left font-semibold text-foreground text-sm">
                            Modified
                          </th>
                          <th className="px-6 py-4 text-left font-semibold text-foreground text-sm">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredFiles.map((file) => (
                          <tr
                            key={file.id}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <Checkbox
                                checked={selectedFiles.includes(file.id)}
                                onCheckedChange={() =>
                                  handleSelectFile(file.id)
                                }
                                className="border-border"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    file.type === "archive"
                                      ? "bg-amber-50 dark:bg-amber-900/20"
                                      : "bg-emerald-50 dark:bg-emerald-900/20"
                                  }`}
                                >
                                  {getFileIcon(file.type)}
                                </div>
                                <button
                                  className="font-medium text-foreground text-sm text-left hover:underline"
                                  onClick={() =>
                                    window.open(file.url, "_blank")
                                  }
                                >
                                  {file.name}
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground text-sm">
                              {file.size}
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant="secondary"
                                className="bg-secondary text-secondary-foreground hover:bg-secondary border-0 font-medium uppercase text-xs"
                              >
                                {file.type}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-muted-foreground">
                                <div className="font-medium">
                                  {new Date(file.modified).toLocaleDateString()}
                                </div>
                                <div className="text-muted-foreground/70">
                                  {new Date(file.modified).toLocaleTimeString()}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  aria-label="Toggle favorite"
                                  className={`p-1 rounded hover:bg-muted/50 transition-colors ${
                                    favorites.includes(file.id)
                                      ? "text-amber-500"
                                      : "text-muted-foreground"
                                  }`}
                                  onClick={() => toggleFavorite(file.id)}
                                >
                                  <Star
                                    className={`h-5 w-5 ${
                                      favorites.includes(file.id)
                                        ? "fill-amber-500"
                                        : ""
                                    }`}
                                  />
                                </button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      aria-label="More actions"
                                      className="p-1.5 hover:bg-muted/50 rounded transition-colors text-muted-foreground"
                                    >
                                      <MoreVertical className="h-5 w-5" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        window.open(file.url, "_blank")
                                      }
                                    >
                                      <ExternalLink className="h-4 w-4" /> View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onClick={() =>
                                        handleDeleteSingle(file.id)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Pagination */}
              <div className="flex items-center justify-between bg-card border border-border rounded-lg px-6 py-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-medium">Rows per page:</span>
                  <Select defaultValue="5">
                    <SelectTrigger className="w-20 h-9 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-foreground font-medium">1-5 of 8</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 border-border hover:bg-muted/50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 border-border hover:bg-muted/50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Storage */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Storage
                </h3>
                <Card className="border border-border shadow-sm bg-card">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <svg
                          className="w-full h-full transform -rotate-90"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#e2e8f0"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#ea580c"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${3.2 * 2.51} 251`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div>
                            <div className="text-3xl font-bold text-foreground">
                              3.2%
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        <span className="font-semibold text-foreground">
                          3.09 MB
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-foreground">
                          95.37 MB
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Storage used
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* File Categories */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Categories
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-orange-400 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <Play className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="font-medium text-foreground text-sm">
                        Media
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-foreground">
                        0 files
                      </div>
                      <div className="text-xs text-muted-foreground">
                        0 bytes
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-orange-400 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-foreground text-sm">
                        Documents
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-foreground">
                        1 files
                      </div>
                      <div className="text-xs text-muted-foreground">
                        344.29 KB
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-orange-400 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-muted rounded-lg">
                        <File className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="font-medium text-foreground text-sm">
                        Other
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-foreground">
                        7 files
                      </div>
                      <div className="text-xs text-muted-foreground">
                        2.75 MB
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
