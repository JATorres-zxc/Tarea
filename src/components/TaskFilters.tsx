import { useState } from 'react';
import { Search, Filter as FilterIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Filter, Priority, Status } from '@/types/task';

interface TaskFiltersProps {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  availableTags: string[];
}

export const TaskFilters = ({ filter, onFilterChange, availableTags }: TaskFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filter, search: value });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filter.tags.includes(tag)
      ? filter.tags.filter(t => t !== tag)
      : [...filter.tags, tag];
    onFilterChange({ ...filter, tags: newTags });
  };

  const handleStatusToggle = (status: Status) => {
    const newStatus = filter.status.includes(status)
      ? filter.status.filter(s => s !== status)
      : [...filter.status, status];
    onFilterChange({ ...filter, status: newStatus });
  };

  const handlePriorityToggle = (priority: Priority) => {
    const newPriority = filter.priority.includes(priority)
      ? filter.priority.filter(p => p !== priority)
      : [...filter.priority, priority];
    onFilterChange({ ...filter, priority: newPriority });
  };

  const handleDueDateChange = (dueDate: Filter['dueDate']) => {
    onFilterChange({ ...filter, dueDate });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      tags: [],
      status: [],
      priority: [],
      dueDate: null
    });
  };

  const activeFiltersCount = 
    filter.tags.length + 
    filter.status.length + 
    filter.priority.length + 
    (filter.dueDate ? 1 : 0);

  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={filter.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <FilterIcon className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>

            <Separator />

            {/* Status Filter */}
            <div>
              <h5 className="font-medium mb-2">Status</h5>
              <div className="space-y-2">
                {(['todo', 'progress', 'done'] as Status[]).map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={status}
                      checked={filter.status.includes(status)}
                      onCheckedChange={() => handleStatusToggle(status)}
                    />
                    <label htmlFor={status} className="text-sm capitalize">
                      {status === 'progress' ? 'In Progress' : status}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Priority Filter */}
            <div>
              <h5 className="font-medium mb-2">Priority</h5>
              <div className="space-y-2">
                {(['low', 'medium', 'high'] as Priority[]).map((priority) => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox
                      id={priority}
                      checked={filter.priority.includes(priority)}
                      onCheckedChange={() => handlePriorityToggle(priority)}
                    />
                    <label htmlFor={priority} className="text-sm capitalize">
                      {priority}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Due Date Filter */}
            <div>
              <h5 className="font-medium mb-2">Due Date</h5>
              <div className="space-y-2">
                {[
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' },
                  { value: 'overdue', label: 'Overdue' }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={filter.dueDate === option.value}
                      onCheckedChange={(checked) => 
                        handleDueDateChange(checked ? option.value as Filter['dueDate'] : null)
                      }
                    />
                    <label htmlFor={option.value} className="text-sm">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div>
                <h5 className="font-medium mb-2">Tags</h5>
                <div className="space-y-2">
                  {availableTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag}
                        checked={filter.tags.includes(tag)}
                        onCheckedChange={() => handleTagToggle(tag)}
                      />
                      <label htmlFor={tag} className="text-sm">
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          {filter.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleTagToggle(tag)}
              />
            </Badge>
          ))}
          {filter.status.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1">
              {status === 'progress' ? 'In Progress' : status}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleStatusToggle(status)}
              />
            </Badge>
          ))}
          {filter.priority.map((priority) => (
            <Badge key={priority} variant="secondary" className="gap-1">
              {priority}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handlePriorityToggle(priority)}
              />
            </Badge>
          ))}
          {filter.dueDate && (
            <Badge variant="secondary" className="gap-1">
              {filter.dueDate}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleDueDateChange(null)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};