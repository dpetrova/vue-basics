// Define a new component
Vue.component('product', {    
    data () {
      return {
        product: 'Socks',
        brand: 'Vue Mastery',
        image: "./assets/socks-green.png",
        altText: "A pair of socks",      
        isPromoted: true,
        details: ["80% cotton", "20% polyester", "Gender-neutral"],
        variants: [
            {id: 1462, color: "green", image: "./assets/socks-green.png", quantity: 0},
            {id: 1499, color: "blue", image: "./assets/socks-blue.png", quantity: 60}
        ],
        selectedVariant: 0,
        mutableCart: this.cart,
        reviews: []
      }
    },
    props: {
        // cart: {
        //     type: Number,
        //     required: true            
        // },
        premium: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    computed: {
        title(){
            return this.brand + ' ' + this.product
        },
        inventory(){
            return this.variants[this.selectedVariant].quantity
        },
        // mutableCart(){
        //     return this.cart
        // }
    },
    mounted() {
        //ES6 Syntax
        eventBus.$on('review-submitted', productReview => {
          this.reviews.push(productReview)
        })
        // eventBus.$on('review-submitted', function (productReview) {
        //   this.reviews.push(productReview)
        // }.bind(this))
    },
    methods: {
        viewProduct(variantImage){
            this.image = variantImage;
        },
        selectProduct(index){
            this.selectedVariant = index
        },
        addToCart(){
            //let modifiedCart = this.cart //Avoid mutating a prop directly
            //modifiedCart += 1                  
            //this.$emit('update:cart', modifiedCart) //will update :cart.sync="cart" in <product>  
            this.$emit('add-to-cart', this.variants[this.selectedVariant].id)         
        },
        // addReview(productReview) {
        //     this.reviews.push(productReview)
        // }
    },
    template: `
    <div class="product">
        <div class="product-image">
            <img :src="image" :alt="altText"/>
        </div>
        <div class="product-info">
            <h1>{{ product }}</h1>
            <p :class="{sold: inventory <=0 }">{{ title }}</p>
            <p v-if="inventory > 10">In stock</p> <!-- v-if add/remove element from DOM -->
            <p v-else-if="inventory <= 10 && inventory > 0">Almost sold out</p>
            <p v-else>Out of stock</p>
            <p v-show="isPromoted">Promotion 50% sale</p> <!-- v-show toggles visibility on/off -->
            <ul>
                <li v-for="detail in details">{{ detail }}</li>
            </ul>
            <div 
            class="box" 
            v-for="(variant, index) in variants" 
            :key="variant.id" 
            :style="{backgroundColor: variant.color}"
            @mouseover="viewProduct(variant.image)"
            @click="selectProduct(index)"
            > <!-- inline style to dynamically set the background-color of our divs -->                    
            </div>

            <br style="clear: both;" />
            <!-- <button v-on:click="cart += 1">Add to cart</button> -->
            <button @click="addToCart" :disabled="inventory <=0 ">Add to cart</button> <!-- @click is a shorthand of v-on:click -->
        </div>        
        
        <product-tabs :reviews="reviews"></product-tabs>
        
    </div>
    `
  })


  Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit"> <!-- .prevent is a event modifier, which is used to prevent the submit event from reloading our page -->
        <p>
            <label for="name">Name:</label>
            <input id="name" v-model="name" placeholder="name">
        </p>        
        <p>
            <label for="review">Review:</label>      
            <textarea id="review" v-model="review"></textarea>
        </p>        
        <p>
            <label for="rating">Rating:</label>
            <select id="rating" v-model.number="rating"> <!-- .number is a modifier ensures that the data will be converted into an integer versus a string -->
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
            </select>
        </p>            
        <p>
            <input type="submit" value="Submit">  
        </p> 
        
        <p v-if="errors.length">
            <b>Please correct the following error(s):</b>
            <ul>
                <li v-for="error in errors">{{ error }}</li>
            </ul>
        </p>
    </form>
    `,
    data() {
      return {
        name: null,
        review: null,
        rating: null,
        errors: []
      }
    },
    methods: {
        onSubmit() {
            if(this.name && this.review && this.rating) {
                let productReview = {
                  name: this.name,
                  review: this.review,
                  rating: this.rating
                }
                //this.$emit('review-submitted', productReview)
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
            } else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
            }
        } 
    }
  })


  Vue.component('product-tabs', {
    props: {
        reviews: {
          type: Array,
          required: true
        }
    },
    template: `
    <div>          
            <div>
              <span class="tab" 
                    v-for="(tab, index) in tabs"
                    :class="{ activeTab: selectedTab === tab }"
                    @click="selectedTab = tab"
              >{{ tab }}</span>
            </div>
            
            <div v-show="selectedTab === 'Reviews'">
                <p v-if="!reviews.length">There are no reviews yet.</p>
                <ul v-else>
                    <li v-for="(review, index) in reviews" :key="index">
                      <p>{{ review.name }}</p>
                      <p>Rating:{{ review.rating }}</p>
                      <p>{{ review.review }}</p>
                    </li>
                </ul>
            </div>

            <div v-show="selectedTab === 'Make a Review'">
                <product-review></product-review>
            </div>
            
    </div>     
    `,
    data() {
      return {
        tabs: ['Reviews', 'Make a Review'],
        selectedTab: 'Reviews'  // set from @click
      }
    }    
  })

  //a common solution for communicating from a grandchild up to a grandparent, 
  //or for communicating between components, is to use what’s called a global event bus;
  //this is essentially a channel through which you can send information amongst your components, 
  //and it’s just a Vue instance, without any options passed into it
  var eventBus = new Vue()


  var app = new Vue({
    el: '#app',
    data: {  
        // cart: 0
        cart: []        
    },
    methods: {
        updateCart(id) {
            this.cart.push(id)
        }    
    }   
  })