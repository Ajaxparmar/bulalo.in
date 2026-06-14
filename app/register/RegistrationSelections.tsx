"use client";

import { useMemo, useState } from "react";

type Plan = {
  id: string;
  name: string;
  durationMonths: number;
  pricePaise: number;
};

type Category = {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
  }[];
};

const emptySelections = ["", "", ""];

export default function RegistrationSelections({
  plans,
  categories,
}: {
  plans: Plan[];
  categories: Category[];
}) {
  const [categoryIds, setCategoryIds] = useState(emptySelections);
  const [subcategoryIds, setSubcategoryIds] = useState(emptySelections);

  const availableSubcategories = useMemo(
    () =>
      categories.flatMap((category) =>
        categoryIds.includes(category.id)
          ? category.subcategories.map((subcategory) => ({
              ...subcategory,
              categoryName: category.name,
            }))
          : [],
      ),
    [categories, categoryIds],
  );

  function updateCategory(index: number, categoryId: string) {
    const nextCategoryIds = categoryIds.map((value, currentIndex) =>
      currentIndex === index ? categoryId : value,
    );
    const validSubcategoryIds = new Set(
      categories.flatMap((category) =>
        nextCategoryIds.includes(category.id)
          ? category.subcategories.map((subcategory) => subcategory.id)
          : [],
      ),
    );

    setCategoryIds(nextCategoryIds);
    setSubcategoryIds((current) =>
      current.map((subcategoryId) =>
        validSubcategoryIds.has(subcategoryId) ? subcategoryId : "",
      ),
    );
  }

  function updateSubcategory(index: number, subcategoryId: string) {
    setSubcategoryIds((current) =>
      current.map((value, currentIndex) => currentIndex === index ? subcategoryId : value),
    );
  }

  return (
    <>
      <div className="selection-box">
        <h2>Select your plan</h2>
        <p className="muted">Choose the subscription duration and fee for your listing.</p>
        <label className="selection-dropdown-label">
          Plan
          <select name="planId" required defaultValue="">
            <option value="" disabled>Select a plan</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} · {plan.durationMonths} month{plan.durationMonths === 1 ? "" : "s"} · ₹{plan.pricePaise / 100}
              </option>
            ))}
          </select>
        </label>
        {plans.length === 0 ? <p className="form-error">No registration plans are currently available.</p> : null}
      </div>

      <div className="selection-box">
        <h2>Select categories</h2>
        <p className="muted">Select at least one and up to three categories.</p>
        <div className="selection-dropdown-grid">
          {categoryIds.map((categoryId, index) => (
            <label key={index} className="selection-dropdown-label">
              Category {index + 1}{index === 0 ? " (required)" : ""}
              <select
                name="categoryIds"
                value={categoryId}
                required={index === 0}
                onChange={(event) => updateCategory(index, event.target.value)}
              >
                <option value="">{index === 0 ? "Select a category" : "Optional category"}</option>
                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                    disabled={categoryIds.some((selectedId, selectedIndex) =>
                      selectedIndex !== index && selectedId === category.id
                    )}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className="selection-box">
        <h2>Select subcategories</h2>
        <p className="muted">Only subcategories from your selected categories are shown.</p>
        <div className="selection-dropdown-grid">
          {subcategoryIds.map((subcategoryId, index) => (
            <label key={index} className="selection-dropdown-label">
              Subcategory {index + 1}{index === 0 ? " (required)" : ""}
              <select
                name="subcategoryIds"
                value={subcategoryId}
                required={index === 0}
                disabled={availableSubcategories.length === 0}
                onChange={(event) => updateSubcategory(index, event.target.value)}
              >
                <option value="">
                  {availableSubcategories.length === 0
                    ? "Select a category first"
                    : index === 0 ? "Select a subcategory" : "Optional subcategory"}
                </option>
                {availableSubcategories.map((subcategory) => (
                  <option
                    key={subcategory.id}
                    value={subcategory.id}
                    disabled={subcategoryIds.some((selectedId, selectedIndex) =>
                      selectedIndex !== index && selectedId === subcategory.id
                    )}
                  >
                    {subcategory.name} · {subcategory.categoryName}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
