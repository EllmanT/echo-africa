import PostForm from "@/components/admin/PostForm";

const NewPostPage = () => (
  <div>
    <h1 className="font-display text-2xl font-bold tracking-tight">New post</h1>
    <p className="mt-1 text-sm text-muted-foreground">It goes live on /playbook as soon as you publish it.</p>
    <div className="mt-6">
      <PostForm initial={null} isNew />
    </div>
  </div>
);

export default NewPostPage;
