import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { ReactNode, useMemo, useState } from "react";
import { useProducts } from "@/context/ProductsContext";

export const SearchDialog: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { products } = useProducts();
  const filtered = useMemo(
    () => products.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())),
    [products, query]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Search products</DialogTitle>
        </DialogHeader>
        <Command shouldFilter={false} className="rounded-t-none border-t">
          <CommandInput placeholder="Search jewellery..." className="h-12" onValueChange={(v) => setQuery(v)} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              {filtered.map((p) => (
                <CommandItem
                  key={p.id}
                  onSelect={() => {
                    setOpen(false);
                    navigate(`/product/${p.id}`);
                  }}
                  className="flex items-center gap-3"
                >
                  <img src={p.images[0]} alt={`${p.title} thumbnail`} className="h-10 w-10 object-cover rounded" />
                  <span className="flex-1">{p.title}</span>
                  <span className="text-muted-foreground">Rs. {Math.round(p.price)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
