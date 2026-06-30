const fs = require('fs');

let code = fs.readFileSync('src/pages/ShopPage.jsx', 'utf8');

// 1. Replace state declarations
const oldStateBlock = `
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('category') ? [searchParams.get('category')] : []
  );
  const [priceRange, setPriceRange] = useState([0, Number(searchParams.get('maxPrice')) || 10000]);
  const [selectedStones, setSelectedStones] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState(
    searchParams.get('occasion') ? [searchParams.get('occasion')] : []
  );
  const [selectedStyles, setSelectedStyles] = useState(
    searchParams.get('style') ? [searchParams.get('style')] : []
  );
  const [sortBy, setSortBy] = useState('popularity');
  const searchQuery = searchParams.get('search')?.trim() || '';
  const badgeFilter = searchParams.get('badge')?.trim() || '';

  useEffect(() => {
    const cp = searchParams.get('category');
    if (cp && !selectedCategories.includes(cp)) setSelectedCategories([cp]);
    const op = searchParams.get('occasion');
    if (op && !selectedOccasions.includes(op)) setSelectedOccasions([op]);
    const sp = searchParams.get('style');
    if (sp && !selectedStyles.includes(sp)) setSelectedStyles([sp]);
    const mp = Number(searchParams.get('maxPrice'));
    if (mp && priceRange[1] !== mp) setPriceRange([0, mp]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);`;

const newStateBlock = `
  const [selectedAvailabilities, setSelectedAvailabilities] = useState([]);
  const [priceRange, setPriceRange] = useState([0, Number(searchParams.get('maxPrice')) || 350000]);
  const [selectedDesigns, setSelectedDesigns] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('category') ? [searchParams.get('category')] : []
  );
  const [selectedStyles, setSelectedStyles] = useState(
    searchParams.get('style') ? [searchParams.get('style')] : []
  );
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState(
    searchParams.get('occasion') ? [searchParams.get('occasion')] : []
  );
  const [selectedColors, setSelectedColors] = useState([]);

  const [sortBy, setSortBy] = useState('popularity');
  const searchQuery = searchParams.get('search')?.trim() || '';
  const badgeFilter = searchParams.get('badge')?.trim() || '';

  useEffect(() => {
    const cp = searchParams.get('category');
    if (cp && !selectedCategories.includes(cp)) setSelectedCategories([cp]);
    const op = searchParams.get('occasion');
    if (op && !selectedOccasions.includes(op)) setSelectedOccasions([op]);
    const sp = searchParams.get('style');
    if (sp && !selectedStyles.includes(sp)) setSelectedStyles([sp]);
    const mp = Number(searchParams.get('maxPrice'));
    if (mp && priceRange[1] !== mp) setPriceRange([0, mp]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);`;

code = code.replace(oldStateBlock.trim(), newStateBlock.trim());

// 2. Replace filteredProducts logic
const oldFilterBlock = `
  const filteredProducts = useMemo(() => {
    let f = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      f = f.filter(p => [p.name, p.category, p.stoneType, p.style, p.shortDescription].some(v => v?.toLowerCase().includes(q)));
    }
    if (badgeFilter) f = f.filter(p => p.badge?.toLowerCase() === badgeFilter.toLowerCase());
    if (selectedCategories.length > 0) f = f.filter(p => selectedCategories.includes(p.category));
    f = f.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (selectedStones.length > 0) f = f.filter(p => selectedStones.includes(p.stoneType));
    if (selectedOccasions.length > 0) f = f.filter(p => selectedOccasions.includes(p.occasion));
    if (selectedStyles.length > 0) f = f.filter(p => selectedStyles.includes(p.style));
    switch (sortBy) {
      case 'price-low': f.sort((a, b) => a.price - b.price); break;
      case 'price-high': f.sort((a, b) => b.price - a.price); break;
      case 'new': f.sort((a, b) => (b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1)); break;
      default: f.sort((a, b) => b.rating - a.rating); break;
    }
    return f;
  }, [searchQuery, badgeFilter, selectedCategories, priceRange, selectedStones, selectedOccasions, selectedStyles, sortBy]);`;

const newFilterBlock = `
  const filteredProducts = useMemo(() => {
    let f = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      f = f.filter(p => [p.name, p.category, p.stoneType, p.style, p.shortDescription].some(v => v?.toLowerCase().includes(q)));
    }
    if (badgeFilter) f = f.filter(p => p.badge?.toLowerCase() === badgeFilter.toLowerCase());
    
    if (selectedAvailabilities.length > 0) {
      f = f.filter(p => {
        if (selectedAvailabilities.includes('in-stock') && p.inStock) return true;
        if (selectedAvailabilities.includes('out-of-stock') && !p.inStock) return true;
        return false;
      });
    }
    
    f = f.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    if (selectedDesigns.length > 0) f = f.filter(p => selectedDesigns.includes(p.design));
    if (selectedCategories.length > 0) f = f.filter(p => selectedCategories.includes(p.category));
    if (selectedStyles.length > 0) f = f.filter(p => selectedStyles.includes(p.style));
    if (selectedCollections.length > 0) f = f.filter(p => selectedCollections.includes(p.collection));
    if (selectedOccasions.length > 0) f = f.filter(p => selectedOccasions.includes(p.occasion));
    if (selectedColors.length > 0) f = f.filter(p => selectedColors.includes(p.color));

    switch (sortBy) {
      case 'price-low': f.sort((a, b) => a.price - b.price); break;
      case 'price-high': f.sort((a, b) => b.price - a.price); break;
      case 'new': f.sort((a, b) => (b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1)); break;
      default: f.sort((a, b) => b.rating - a.rating); break;
    }
    return f;
  }, [searchQuery, badgeFilter, selectedCategories, priceRange, selectedAvailabilities, selectedDesigns, selectedCollections, selectedColors, selectedOccasions, selectedStyles, sortBy]);`;

code = code.replace(oldFilterBlock.trim(), newFilterBlock.trim());

// 3. Replace clearFilters and totalActive
const oldClearBlock = `
  const totalActive = selectedCategories.length + selectedStones.length + selectedOccasions.length + selectedStyles.length + (priceRange[1] < 10000 ? 1 : 0);

  const handleCheckbox = (setState, state, value) => {
    setState(state.includes(value) ? state.filter(i => i !== value) : [...state, value]);
    setVisibleCount(12);
  };

  const clearFilters = () => {
    setSelectedCategories([]); setPriceRange([0, 10000]); setSelectedStones([]);
    setSelectedOccasions([]); setSelectedStyles([]); setSortBy('popularity');
    setSearchParams({}); setVisibleCount(12);
  };`;

const newClearBlock = `
  const totalActive = selectedAvailabilities.length + selectedCategories.length + selectedDesigns.length + selectedOccasions.length + selectedStyles.length + selectedCollections.length + selectedColors.length + (priceRange[1] < 350000 ? 1 : 0);

  const handleCheckbox = (setState, state, value) => {
    setState(state.includes(value) ? state.filter(i => i !== value) : [...state, value]);
    setVisibleCount(12);
  };

  const clearFilters = () => {
    setSelectedAvailabilities([]); setPriceRange([0, 350000]); setSelectedDesigns([]);
    setSelectedCategories([]); setSelectedStyles([]); setSelectedCollections([]);
    setSelectedOccasions([]); setSelectedColors([]); setSortBy('popularity');
    setSearchParams({}); setVisibleCount(12);
  };`;

code = code.replace(oldClearBlock.trim(), newClearBlock.trim());

// 4. Replace SidebarContent
// We use a regex or string replacement for the SidebarContent function
const sidebarStart = '  const SidebarContent = () => (';
const sidebarEnd = '  );';
const sidebarIndex = code.indexOf(sidebarStart);
const sidebarEndIndex = code.indexOf(sidebarEnd, sidebarIndex) + sidebarEnd.length;

const newSidebarContent = `  const SidebarContent = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="font-serif text-[22px] text-text-main">Refine</span>
        {totalActive > 0 && (
          <button onClick={clearFilters} className="text-[11px] font-semibold uppercase tracking-[1px] text-[#D4527A] hover:text-[#B94B68] transition-colors">
            Clear all ({totalActive})
          </button>
        )}
      </div>

      <FilterSection title="Availability">
        <div className="flex flex-col gap-1">
          <LuxuryCheckbox
            checked={selectedAvailabilities.includes('in-stock')}
            onChange={() => handleCheckbox(setSelectedAvailabilities, selectedAvailabilities, 'in-stock')}
            label="In Stock"
          />
          <LuxuryCheckbox
            checked={selectedAvailabilities.includes('out-of-stock')}
            onChange={() => handleCheckbox(setSelectedAvailabilities, selectedAvailabilities, 'out-of-stock')}
            label="Out of Stock"
          />
        </div>
      </FilterSection>

      <FilterSection title="Price">
        <div className="px-1">
          <input
            type="range" min="0" max="350000"
            value={priceRange[1]}
            onChange={e => { setPriceRange([0, parseInt(e.target.value)]); setVisibleCount(12); }}
            className="w-full accent-[#D4527A]"
          />
          <div className="flex justify-between mt-3">
            <span className="text-[12px] font-medium text-[#D4527A] bg-[#FFF0F5] border border-[#F4A0B0]/30 px-2.5 py-1 rounded-full">₹0</span>
            <span className="text-[12px] font-medium text-[#D4527A] bg-[#FFF0F5] border border-[#F4A0B0]/30 px-2.5 py-1 rounded-full">₹{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Design">
        <div className="flex flex-col gap-1">
          {designs && designs.map(d => (
            <LuxuryCheckbox
              key={d.id} checked={selectedDesigns.includes(d.id)}
              onChange={() => handleCheckbox(setSelectedDesigns, selectedDesigns, d.id)}
              label={d.name}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Jewel Type">
        <div className="flex flex-col gap-1">
          {categories.map(c => (
            <LuxuryCheckbox
              key={c.id} checked={selectedCategories.includes(c.id)}
              onChange={() => handleCheckbox(setSelectedCategories, selectedCategories, c.id)}
              label={c.name}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Style">
        <div className="flex flex-col gap-1">
          {styles.map(s => (
            <LuxuryCheckbox
              key={s.id} checked={selectedStyles.includes(s.id)}
              onChange={() => handleCheckbox(setSelectedStyles, selectedStyles, s.id)}
              label={s.name}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Shop By Collections">
        <div className="flex flex-col gap-1">
          {collections && collections.map(c => (
            <LuxuryCheckbox
              key={c.id} checked={selectedCollections.includes(c.id)}
              onChange={() => handleCheckbox(setSelectedCollections, selectedCollections, c.id)}
              label={c.name}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Occasions">
        <div className="flex flex-col gap-1">
          {occasions.map(o => (
            <LuxuryCheckbox
              key={o.id} checked={selectedOccasions.includes(o.id)}
              onChange={() => handleCheckbox(setSelectedOccasions, selectedOccasions, o.id)}
              label={o.name}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Color">
        <div className="flex flex-col gap-2 mt-1">
          {colors && colors.map(c => {
            const isSelected = selectedColors.includes(c.id);
            return (
              <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                <div 
                  className={\`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center \${isSelected ? 'border-[#D4527A] scale-110' : 'border-transparent shadow-sm group-hover:border-[#D9C5C9]'}\`}
                  style={{ backgroundColor: c.hex }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCheckbox(setSelectedColors, selectedColors, c.id)}
                    className="hidden"
                  />
                  {isSelected && <Check size={12} className="text-white drop-shadow-md" strokeWidth={3} />}
                </div>
                <span className={\`text-[13px] uppercase tracking-[0.5px] \${isSelected ? 'font-medium text-text-main' : 'text-text-muted group-hover:text-text-main'}\`}>
                  {c.name}
                </span>
              </label>
            )
          })}
        </div>
      </FilterSection>
    </div>
  );`;

code = code.substring(0, sidebarIndex) + newSidebarContent + code.substring(sidebarEndIndex);

// 5. Update active pill tags in header
const activePillReplacement = `
                {selectedCategories.map(c => (
                  <span key={c} className="flex items-center gap-1.5 rounded-full bg-[#FFF0F5] border border-[#F4A0B0]/40 px-3 py-1.5 text-[11px] font-medium text-[#D4527A]">
                    {c}
                    <button onClick={() => handleCheckbox(setSelectedCategories, selectedCategories, c)}><X size={10} /></button>
                  </span>
                ))}
                {selectedOccasions.map(o => (
                  <span key={o} className="flex items-center gap-1.5 rounded-full bg-[#FFF0F5] border border-[#F4A0B0]/40 px-3 py-1.5 text-[11px] font-medium text-[#D4527A]">
                    {o}
                    <button onClick={() => handleCheckbox(setSelectedOccasions, selectedOccasions, o)}><X size={10} /></button>
                  </span>
                ))}
`;

const newPills = `
                {[
                  ...selectedAvailabilities.map(x => ({ val: x, set: setSelectedAvailabilities, state: selectedAvailabilities })),
                  ...selectedCategories.map(x => ({ val: x, set: setSelectedCategories, state: selectedCategories })),
                  ...selectedDesigns.map(x => ({ val: x, set: setSelectedDesigns, state: selectedDesigns })),
                  ...selectedStyles.map(x => ({ val: x, set: setSelectedStyles, state: selectedStyles })),
                  ...selectedCollections.map(x => ({ val: x, set: setSelectedCollections, state: selectedCollections })),
                  ...selectedOccasions.map(x => ({ val: x, set: setSelectedOccasions, state: selectedOccasions })),
                  ...selectedColors.map(x => ({ val: x, set: setSelectedColors, state: selectedColors })),
                ].map((item, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 rounded-full bg-[#FFF0F5] border border-[#F4A0B0]/40 px-3 py-1.5 text-[11px] font-medium text-[#D4527A] capitalize">
                    {item.val.replace(/-/g, ' ')}
                    <button onClick={() => handleCheckbox(item.set, item.state, item.val)}><X size={10} /></button>
                  </span>
                ))}
`;
code = code.replace(activePillReplacement.trim(), newPills.trim());

fs.writeFileSync('src/pages/ShopPage.jsx', code);
console.log('Successfully updated ShopPage.jsx');
