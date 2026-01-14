import React, { useRef, useEffect } from 'react';
import './Styles/CategorySelector.css';

const CategorySelector = ({ categories, activeCategory, onSelectCategory }) => {
    const scrollRef = useRef(null);
    const activePillRef = useRef(null);

    // Scroll active category into view on mount
    useEffect(() => {
        if (activePillRef.current && scrollRef.current) {
            const container = scrollRef.current;
            const pill = activePillRef.current;

            const scrollLeft = pill.offsetLeft - (container.offsetWidth / 2) + (pill.offsetWidth / 2);
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    }, [activeCategory]);

    return (
        <div className="category-selector-wrapper">
            <div className="category-selector" ref={scrollRef}>
                {categories.map(category => (
                    <button
                        key={category.categoryId}
                        ref={activeCategory?.categoryId === category.categoryId ? activePillRef : null}
                        className={`category-pill ${activeCategory?.categoryId === category.categoryId ? 'active' : ''
                            }`}
                        onClick={() => onSelectCategory(category)}
                    >
                        <div className="category-pill-inner">
                            {category.name}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategorySelector;
