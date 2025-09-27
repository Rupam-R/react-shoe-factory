import React from 'react';
import Header from '../components/Header'
import Footer from '../components/Footer'
const Category = () => {
  return (
    <div>
      {/* Start Banner Area */}
      <Header />
      <section className="banner-area organic-breadcrumb">
        <div className="container">
          <div className="breadcrumb-banner d-flex flex-wrap align-items-center justify-content-end">
            <div className="col-first">
              <h1>Shop Category page</h1>
              <nav className="d-flex align-items-center">
                <a href="index.html">Home<span className="lnr lnr-arrow-right"></span></a>
                <a href="#">Shop<span className="lnr lnr-arrow-right"></span></a>
                <a href="category.html">Fashon Category</a>
              </nav>
            </div>
          </div>
        </div>
      </section>
      {/* End Banner Area */}
      
      <div className="container">
        <div className="row">
          <div className="col-xl-3 col-lg-4 col-md-5">
            <div className="sidebar-categories">
              <div className="head">Browse Categories</div>
              <ul className="main-categories">
                <li className="main-nav-list">
                  <a data-toggle="collapse" href="#fruitsVegetable" aria-expanded="false" aria-controls="fruitsVegetable">
                    <span className="lnr lnr-arrow-right"></span>Fruits and Vegetables<span className="number">(53)</span>
                  </a>
                  <ul className="collapse" id="fruitsVegetable" data-toggle="collapse" aria-expanded="false" aria-controls="fruitsVegetable">
                    <li className="main-nav-list child"><a href="#">Frozen Fish<span className="number">(13)</span></a></li>
                    <li className="main-nav-list child"><a href="#">Dried Fish<span className="number">(09)</span></a></li>
                    <li className="main-nav-list child"><a href="#">Fresh Fish<span className="number">(17)</span></a></li>
                    <li className="main-nav-list child"><a href="#">Meat Alternatives<span className="number">(01)</span></a></li>
                    <li className="main-nav-list child"><a href="#">Meat<span className="number">(11)</span></a></li>
                  </ul>
                </li>

                {/* Other categories with the same structure */}
                {['Meat and Fish', 'Cooking', 'Beverages', 'Home and Cleaning', 'Office Products', 'Beauty Products', 'Health Products', 'Home Appliances', 'Baby Care'].map((category) => (
                  <li className="main-nav-list" key={category}>
                    <a data-toggle="collapse" href={`#${category.replace(/\s+/g, '')}`} aria-expanded="false" aria-controls={category.replace(/\s+/g, '')}>
                      <span className="lnr lnr-arrow-right"></span>{category}<span className="number">(53)</span>
                    </a>
                    <ul className="collapse" id={category.replace(/\s+/g, '')} data-toggle="collapse" aria-expanded="false" aria-controls={category.replace(/\s+/g, '')}>
                      <li className="main-nav-list child"><a href="#">Frozen Fish<span className="number">(13)</span></a></li>
                      <li className="main-nav-list child"><a href="#">Dried Fish<span className="number">(09)</span></a></li>
                      <li className="main-nav-list child"><a href="#">Fresh Fish<span className="number">(17)</span></a></li>
                      <li className="main-nav-list child"><a href="#">Meat Alternatives<span className="number">(01)</span></a></li>
                      <li className="main-nav-list child"><a href="#">Meat<span className="number">(11)</span></a></li>
                    </ul>
                  </li>
                ))}

                {/* Simple categories without dropdown */}
                {['Pest Control', 'Pet Care'].map((category) => (
                  <li className="main-nav-list" key={category}>
                    <a href="#">{category}<span className="number">(24)</span></a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="sidebar-filter mt-50">
              <div className="top-filter-head">Product Filters</div>
              <div className="common-filter">
                <div className="head">Brands</div>
                <form action="#">
                  <ul>
                    {['Apple', 'Asus', 'Gionee', 'Micromax', 'Samsung'].map((brand) => (
                      <li className="filter-list" key={brand}>
                        <input className="pixel-radio" type="radio" id={brand.toLowerCase()} name="brand"/>
                        <label htmlFor={brand.toLowerCase()}>{brand}<span>(29)</span></label>
                      </li>
                    ))}
                  </ul>
                </form>
              </div>
              
              <div className="common-filter">
                <div className="head">Color</div>
                <form action="#">
                  <ul>
                    {['Black', 'Black Leather', 'Black with red', 'Gold', 'Spacegrey'].map((color) => (
                      <li className="filter-list" key={color.replace(/\s+/g, '')}>
                        <input className="pixel-radio" type="radio" id={color.replace(/\s+/g, '').toLowerCase()} name="color"/>
                        <label htmlFor={color.replace(/\s+/g, '').toLowerCase()}>{color}<span>(29)</span></label>
                      </li>
                    ))}
                  </ul>
                </form>
              </div>
              
              <div className="common-filter">
                <div className="head">Price</div>
                <div className="price-range-area">
                  <div id="price-range"></div>
                  <div className="value-wrapper d-flex">
                    <div className="price">Price:</div>
                    <span>$</span>
                    <div id="lower-value"></div>
                    <div className="to">to</div>
                    <span>$</span>
                    <div id="upper-value"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-xl-9 col-lg-8 col-md-7">
            {/* Start Filter Bar */}
            <div className="filter-bar d-flex flex-wrap align-items-center">
              <div className="sorting">
                <select>
                  <option value="1">Default sorting</option>
                  <option value="2">Sort by price</option>
                  <option value="3">Sort by popularity</option>
                </select>
              </div>
              <div className="sorting mr-auto">
                <select>
                  <option value="1">Show 12</option>
                  <option value="2">Show 24</option>
                  <option value="3">Show 36</option>
                </select>
              </div>
              <div className="pagination">
                <a href="#" className="prev-arrow"><i className="fa fa-long-arrow-left" aria-hidden="true"></i></a>
                <a href="#" className="active">1</a>
                <a href="#">2</a>
                <a href="#">3</a>
                <a href="#" className="dot-dot"><i className="fa fa-ellipsis-h" aria-hidden="true"></i></a>
                <a href="#">6</a>
                <a href="#" className="next-arrow"><i className="fa fa-long-arrow-right" aria-hidden="true"></i></a>
              </div>
            </div>
            {/* End Filter Bar */}
            
            {/* Start Best Seller */}
            <section className="lattest-product-area pb-40 category-list">
              <div className="row">
                {/* Product items */}
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div className="col-lg-4 col-md-6" key={item}>
                    <div className="single-product">
                      <img className="img-fluid" src={`img/product/p${item}.jpg`} alt={`Product ${item}`} />
                      <div className="product-details">
                        <h6>addidas New Hammer sole for Sports person</h6>
                        <div className="price">
                          <h6>$150.00</h6>
                          <h6 className="l-through">$210.00</h6>
                        </div>
                        <div className="prd-bottom">
                          <a href="#" className="social-info">
                            <span className="ti-bag"></span>
                            <p className="hover-text">add to bag</p>
                          </a>
                          <a href="#" className="social-info">
                            <span className="lnr lnr-heart"></span>
                            <p className="hover-text">Wishlist</p>
                          </a>
                          <a href="#" className="social-info">
                            <span className="lnr lnr-sync"></span>
                            <p className="hover-text">compare</p>
                          </a>
                          <a href="#" className="social-info">
                            <span className="lnr lnr-move"></span>
                            <p className="hover-text">view more</p>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            {/* End Best Seller */}
            
            {/* Start Filter Bar */}
            <div className="filter-bar d-flex flex-wrap align-items-center">
              <div className="sorting mr-auto">
                <select>
                  <option value="1">Show 12</option>
                  <option value="2">Show 24</option>
                  <option value="3">Show 36</option>
                </select>
              </div>
              <div className="pagination">
                <a href="#" className="prev-arrow"><i className="fa fa-long-arrow-left" aria-hidden="true"></i></a>
                <a href="#" className="active">1</a>
                <a href="#">2</a>
                <a href="#">3</a>
                <a href="#" className="dot-dot"><i className="fa fa-ellipsis-h" aria-hidden="true"></i></a>
                <a href="#">6</a>
                <a href="#" className="next-arrow"><i className="fa fa-long-arrow-right" aria-hidden="true"></i></a>
              </div>
            </div>
            {/* End Filter Bar */}
          </div>
        </div>
      </div>

      {/* Start related-product Area */}
      <section className="related-product-area section_gap">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 text-center">
              <div className="section-title">
                <h1>Deals of the Week</h1>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-9">
              <div className="row">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
                  <div className="col-lg-4 col-md-4 col-sm-6 mb-20" key={item}>
                    <div className="single-related-product d-flex">
                      <a href="#"><img src={`img/r${item}.jpg`} alt={`Related product ${item}`} /></a>
                      <div className="desc">
                        <a href="#" className="title">Black lace Heels</a>
                        <div className="price">
                          <h6>$189.00</h6>
                          <h6 className="l-through">$210.00</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-3">
              <div className="ctg-right">
                <a href="#" target="_blank">
                  <img className="img-fluid d-block mx-auto" src="img/category/c5.jpg" alt="Category" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End related-product Area */}
        <Footer />
    </div>
  );
};

export default Category;