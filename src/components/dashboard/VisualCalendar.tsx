import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths,
  subMonths,
  parseISO
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft,
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Share2,
  Link2,
  Plus,
  Inbox,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { PostStatus } from '../../api/posts';
import type { Post } from '../../api/posts';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface VisualCalendarProps {
  posts: Post[];
  onDateChange: (postId: number, newDate: Date) => void;
  onEditPost: (post: Post) => void;
  onAddPost: (date: Date) => void;
}

const VisualCalendar: React.FC<VisualCalendarProps> = ({ posts, onDateChange, onEditPost, onAddPost }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const calendarPosts = useMemo(() => posts.filter(p => 
    (p.status === PostStatus.SCHEDULED || p.status === PostStatus.PUBLISHED || p.status === PostStatus.FAILED) && 
    (p.scheduledAt || p.publishedAt)
  ), [posts]);
  const drafts = useMemo(() => posts.filter(p => p.status === PostStatus.DRAFT), [posts]);
  const evergreen = useMemo(() => posts.filter(p => p.isEvergreen && p.status === PostStatus.PUBLISHED), [posts]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const postId = active.id as number;
      const newDateStr = over.id as string;
      
      // If dropped on a day (not another post/container)
      if (newDateStr.includes('-')) {
        const newDate = new Date(newDateStr);
        
        // Keep the original time if possible, else default to 9:00 AM
        const originalPost = posts.find(p => p.id === postId);
        if (originalPost?.scheduledAt) {
          const originalDateTime = parseISO(originalPost.scheduledAt);
          newDate.setHours(originalDateTime.getHours(), originalDateTime.getMinutes());
        } else {
          newDate.setHours(9, 0, 0); // Default to 9:00 AM for drafts/evergreen
        }
        
        onDateChange(postId, newDate);
      }
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col lg:flex-row gap-8 h-[900px] animate-in fade-in duration-700 overflow-hidden">
        {/* Content Vault Sidebar */}
        {isSidebarOpen && (
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            <div className="bg-card/40 backdrop-blur-3xl border-2 border-white/5 rounded-[2.5rem] p-6 h-full flex flex-col gap-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Inbox size={100} className="text-primary" />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-black tracking-tighter uppercase italic text-primary flex items-center gap-2">
                  <Inbox size={20} />
                  Drafts Vault
                </h3>
                <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-1">Ready for scheduling</p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-10">
                {drafts.length === 0 && evergreen.length === 0 && (
                  <div className="text-center py-10 opacity-40">
                    <Zap size={32} className="mx-auto mb-3" />
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">No content in vault.<br/>Generate something new!</p>
                  </div>
                )}
                
                {drafts.length > 0 && (
                  <div className="space-y-3">
                    <SortableContext items={drafts.map(d => d.id!)} strategy={rectSortingStrategy}>
                      {drafts.map(post => (
                        <SortablePost key={post.id} post={post} onEdit={() => onEditPost(post)} isDraft />
                      ))}
                    </SortableContext>
                  </div>
                )}

                {evergreen.length > 0 && (
                  <div className="pt-6 border-t border-white/5 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 pl-1">Evergreen Pool</h4>
                    <SortableContext items={evergreen.map(d => d.id!)} strategy={rectSortingStrategy}>
                      {evergreen.map(post => (
                        <SortablePost key={post.id} post={post} onEdit={() => onEditPost(post)} isEvergreen />
                      ))}
                    </SortableContext>
                  </div>
                )}
              </div>

              <button 
                onClick={() => onAddPost(new Date())}
                className="w-full py-4 bg-primary/10 border-2 border-dashed border-primary/30 rounded-2xl text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                Quick Transmission
              </button>
            </div>
          </aside>
        )}

        {/* Calendar Main Grid */}
        <div className="flex-1 flex flex-col gap-8 overflow-hidden">
          <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-card/30 backdrop-blur-xl p-6 rounded-[2rem] border-2 border-white/5 shadow-xl">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/30 shadow-lg">
                <CalendarIcon size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-2 mt-1 min-h-[1.5rem]">
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.1em] opacity-60 leading-none">
                    Visual Content Orchestrator
                  </p>
                  <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                  <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="text-[10px] font-black uppercase tracking-[0.1em] text-primary hover:text-primary/80 transition-colors leading-none"
                  >
                    {isSidebarOpen ? 'Hide Vault' : 'Show Vault'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-2xl border border-white/10 shadow-inner">
              <button 
                onClick={handlePrevMonth}
                className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-muted-foreground hover:text-primary active:scale-90"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={handleToday}
                className="px-5 py-2 text-[9px] font-black uppercase tracking-widest bg-primary text-white hover:bg-primary/90 rounded-xl transition-all shadow-lg active:scale-95"
              >
                Today
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-muted-foreground hover:text-primary active:scale-90"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </header>

          <div className="grid grid-cols-7 gap-4 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center py-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 sticky top-0 bg-background/80 backdrop-blur-md z-20">
                {day}
              </div>
            ))}
            
            <SortableContext items={calendarDays.map(d => d.toISOString())} strategy={rectSortingStrategy}>
              {calendarDays.map((day) => {
                const dayStr = day.toISOString();
                const dayPosts = calendarPosts.filter(p => {
                  const pDate = p.publishedAt ? parseISO(p.publishedAt) : (p.scheduledAt ? parseISO(p.scheduledAt) : null);
                  return pDate ? isSameDay(pDate, day) : false;
                });
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, monthStart);

                return (
                  <CalendarDay 
                    key={dayStr}
                    day={day}
                    isToday={isToday}
                    isCurrentMonth={isCurrentMonth}
                    posts={dayPosts}
                    onEditPost={onEditPost}
                    onAddPost={onAddPost}
                  />
                );
              })}
            </SortableContext>
          </div>
        </div>

        <DragOverlay dropAnimation={{
          ...defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeId ? (
            <div className="w-full h-full scale-105 pointer-events-none">
              <PostThumbnail 
                post={posts.find(p => p.id === activeId)!} 
                isDragging 
                isSidebarItem={drafts.some(d => d.id === activeId) || evergreen.some(e => e.id === activeId)}
              />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

interface CalendarDayProps {
  day: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  posts: Post[];
  onEditPost: (post: Post) => void;
  onAddPost: (date: Date) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ day, isToday, isCurrentMonth, posts, onEditPost, onAddPost }) => {
  const { setNodeRef, isOver } = useSortable({
    id: day.toISOString(),
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "min-h-[160px] p-4 rounded-[2rem] border-2 transition-all relative group flex flex-col gap-3",
        isToday ? "bg-primary/5 border-primary/30 shadow-[0_0_40px_rgba(var(--primary),0.05)]" : "bg-card/20 border-white/5 hover:border-white/10",
        !isCurrentMonth && "opacity-20 grayscale-[0.8]",
        isOver && "bg-primary/20 border-primary/50 scale-[1.02] z-10 shadow-2xl"
      )}
    >
      <div className="flex justify-between items-center">
        <span className={cn(
          "text-xs font-black w-8 h-8 flex items-center justify-center rounded-xl tracking-tighter shadow-sm",
          isToday ? "bg-primary text-white" : "bg-secondary/20 text-muted-foreground/60 border border-white/5"
        )}>
          {format(day, 'd')}
        </span>
        <button 
          onClick={() => onAddPost(day)}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-primary/20 rounded-xl text-primary transition-all active:scale-90"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto max-h-[120px] scrollbar-none px-0.5">
        {posts.map(post => (
          <SortablePost key={post.id} post={post} onEdit={() => onEditPost(post)} />
        ))}
      </div>
    </div>
  );
};

interface SortablePostProps {
  post: Post;
  onEdit: () => void;
  isDraft?: boolean;
  isEvergreen?: boolean;
}

const SortablePost = ({ post, onEdit, isDraft, isEvergreen }: SortablePostProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: post.id!,
    disabled: post.status === PostStatus.PUBLISHED
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 100 : 1,
    cursor: post.status === PostStatus.PUBLISHED ? 'default' : 'grab',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
    >
      <PostThumbnail post={post} isDraft={isDraft} isEvergreen={isEvergreen} />
    </div>
  );
};

interface PostThumbnailProps {
  post: Post;
  isDragging?: boolean;
  isSidebarItem?: boolean;
  isDraft?: boolean;
  isEvergreen?: boolean;
}

const PostThumbnail = ({ post, isDragging, isSidebarItem, isDraft, isEvergreen }: PostThumbnailProps) => {
  const platformIcon = () => {
    switch (post.platform?.toUpperCase()) {
      case 'INSTAGRAM': return <Share2 size={10} />;
      case 'FACEBOOK': return <Link2 size={10} />;
      default: return <Sparkles size={10} />;
    }
  };

  const statusIndicator = () => {
    switch (post.status) {
      case PostStatus.PUBLISHED: return <CheckCircle2 size={12} className="text-emerald-500" />;
      case PostStatus.FAILED: return <Plus size={12} className="text-rose-500 rotate-45" />;
      default: return null;
    }
  };

  const platformColor = () => {
    switch (post.platform?.toUpperCase()) {
      case 'INSTAGRAM': return 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600';
      case 'FACEBOOK': return 'bg-blue-600';
      default: return 'bg-primary';
    }
  };

  return (
    <div className={cn(
      "w-full group/post shadow-lg transition-all cursor-grab active:cursor-grabbing relative overflow-hidden",
      isSidebarItem || isDraft || isEvergreen ? "p-3 bg-card/60 rounded-2xl border border-white/5 hover:border-primary/40" : "p-1.5 bg-secondary/30 rounded-xl border border-white/5",
      isDragging && "shadow-2xl shadow-primary/30 scale-105 border-primary bg-primary/10",
      isEvergreen && "border-emerald-500/20 hover:border-emerald-500/40"
    )}>
      {isEvergreen && (
        <div className="absolute top-0 right-0 p-1 opacity-20">
          <Sparkles size={12} className="text-emerald-500" />
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <div className={cn(
          "rounded-lg overflow-hidden shrink-0 border border-white/10 relative shadow-inner",
          isSidebarItem || isDraft || isEvergreen ? "w-12 h-12" : "w-10 h-10"
        )}>
          {post.imageUrl ? (
            <img src={post.imageUrl} alt="" className="w-full h-full object-cover group-hover/post:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-secondary/50 flex items-center justify-center text-muted-foreground/30">
              <Zap size={14} />
            </div>
          )}
          <div className={cn(
            "absolute -bottom-1 -right-1 p-0.5 rounded-full text-white border border-background shadow-lg",
            platformColor()
          )}>
            {platformIcon()}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium truncate text-white leading-tight",
            isSidebarItem || isDraft || isEvergreen ? "text-xs mb-1" : "text-[10px]"
          )}>
            {post.caption || 'Unlabeled Masterpiece'}
          </p>
          <div className="flex items-center gap-1.5 opacity-40">
            <Clock size={8} />
            <span className="text-[8px] font-black uppercase tracking-[0.1em]">
              {post.status === 'SCHEDULED' && post.scheduledAt 
                ? format(parseISO(post.scheduledAt), 'HH:mm') 
                : post.status === 'PUBLISHED' ? 'PUBLISHED' : post.status === 'FAILED' ? 'FAILED' : 'DRAFT'}
            </span>
            {statusIndicator()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualCalendar;
