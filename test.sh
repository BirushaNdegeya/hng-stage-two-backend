#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

# Counter for tests
PASSED=0
FAILED=0

# Function to print test results
print_test() {
    local test_name=$1
    local status=$2
    if [ "$status" -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $test_name"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $test_name"
        ((FAILED++))
    fi
}

# Function to print section headers
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Function to make HTTP requests and display response
make_request() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -e "${YELLOW}Testing:${NC} $description"
    echo -e "${YELLOW}Endpoint:${NC} $method $endpoint"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo -e "${YELLOW}Status Code:${NC} $http_code"
    echo -e "${YELLOW}Response:${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
    
    return $http_code
}

# Start testing
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Country Currency & Exchange API     ║${NC}"
echo -e "${BLUE}║           Test Suite                   ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"

# Test 1: Check if server is running
print_header "1. Server Health Check"
make_request "GET" "/status" "Check API status"
if [ $? -eq 200 ] || [ $? -eq 404 ]; then
    print_test "Server is running" 0
else
    print_test "Server is running" 1
    echo -e "${RED}Server is not accessible. Please start the server first.${NC}"
    exit 1
fi

# Test 2: Initial status check
print_header "2. Initial Status"
make_request "GET" "/status" "Get initial status"
print_test "GET /status" $?

# Test 3: Refresh countries data
print_header "3. Refresh Countries Data"
echo -e "${YELLOW}Note: This may take 30-60 seconds...${NC}"
make_request "POST" "/countries/refresh" "Fetch and cache country data"
refresh_code=$?
if [ $refresh_code -eq 200 ] || [ $refresh_code -eq 201 ]; then
    print_test "POST /countries/refresh" 0
else
    print_test "POST /countries/refresh" 1
fi

# Wait a bit for data to be processed
sleep 2

# Test 4: Get all countries
print_header "4. Get All Countries"
make_request "GET" "/countries" "Get all countries (first 5 shown)"
if [ $? -eq 200 ]; then
    print_test "GET /countries" 0
else
    print_test "GET /countries" 1
fi

# Test 5: Filter by region
print_header "5. Filter by Region"
make_request "GET" "/countries?region=Africa" "Get African countries"
if [ $? -eq 200 ]; then
    print_test "GET /countries?region=Africa" 0
else
    print_test "GET /countries?region=Africa" 1
fi

make_request "GET" "/countries?region=Europe" "Get European countries"
if [ $? -eq 200 ]; then
    print_test "GET /countries?region=Europe" 0
else
    print_test "GET /countries?region=Europe" 1
fi

# Test 6: Filter by currency
print_header "6. Filter by Currency"
make_request "GET" "/countries?currency=USD" "Get countries using USD"
if [ $? -eq 200 ]; then
    print_test "GET /countries?currency=USD" 0
else
    print_test "GET /countries?currency=USD" 1
fi

make_request "GET" "/countries?currency=EUR" "Get countries using EUR"
if [ $? -eq 200 ]; then
    print_test "GET /countries?currency=EUR" 0
else
    print_test "GET /countries?currency=EUR" 1
fi

# Test 7: Sort by GDP
print_header "7. Sort by GDP"
make_request "GET" "/countries?sort=gdp_desc" "Get countries sorted by GDP (descending)"
if [ $? -eq 200 ]; then
    print_test "GET /countries?sort=gdp_desc" 0
else
    print_test "GET /countries?sort=gdp_desc" 1
fi

make_request "GET" "/countries?sort=gdp_asc" "Get countries sorted by GDP (ascending)"
if [ $? -eq 200 ]; then
    print_test "GET /countries?sort=gdp_asc" 0
else
    print_test "GET /countries?sort=gdp_asc" 1
fi

# Test 8: Combined filters
print_header "8. Combined Filters"
make_request "GET" "/countries?region=Africa&sort=gdp_desc" "Get African countries sorted by GDP"
if [ $? -eq 200 ]; then
    print_test "GET /countries?region=Africa&sort=gdp_desc" 0
else
    print_test "GET /countries?region=Africa&sort=gdp_desc" 1
fi

# Test 9: Get specific country
print_header "9. Get Specific Country"
make_request "GET" "/countries/Nigeria" "Get Nigeria by name"
if [ $? -eq 200 ]; then
    print_test "GET /countries/Nigeria" 0
else
    print_test "GET /countries/Nigeria" 1
fi

make_request "GET" "/countries/Germany" "Get Germany by name"
if [ $? -eq 200 ]; then
    print_test "GET /countries/Germany" 0
else
    print_test "GET /countries/Germany" 1
fi

# Test 10: Get non-existent country (should return 404)
print_header "10. Error Handling - Non-existent Country"
make_request "GET" "/countries/Wakanda" "Get non-existent country"
if [ $? -eq 404 ]; then
    print_test "GET /countries/Wakanda (404 expected)" 0
else
    print_test "GET /countries/Wakanda (404 expected)" 1
fi

# Test 11: Get summary image
print_header "11. Get Summary Image"
echo -e "${YELLOW}Testing:${NC} Get summary image"
echo -e "${YELLOW}Endpoint:${NC} GET /countries/image"
curl -s -o /tmp/summary_test.png -w "%{http_code}" "$BASE_URL/countries/image" > /tmp/http_code.txt
image_code=$(cat /tmp/http_code.txt)
echo -e "${YELLOW}Status Code:${NC} $image_code"

if [ $image_code -eq 200 ]; then
    if file /tmp/summary_test.png | grep -q "image"; then
        echo -e "${GREEN}Image downloaded successfully${NC}"
        print_test "GET /countries/image" 0
    else
        echo -e "${RED}Response is not a valid image${NC}"
        print_test "GET /countries/image" 1
    fi
else
    echo -e "${YELLOW}Image not available or endpoint not implemented${NC}"
    print_test "GET /countries/image" 1
fi
echo ""

# Test 12: Status after refresh
print_header "12. Status After Refresh"
make_request "GET" "/status" "Get status after refresh"
if [ $? -eq 200 ]; then
    print_test "GET /status (after refresh)" 0
else
    print_test "GET /status (after refresh)" 1
fi

# Test 13: Delete a country
print_header "13. Delete Country"
make_request "DELETE" "/countries/TestCountry" "Delete a test country (may not exist)"
delete_code=$?
if [ $delete_code -eq 200 ] || [ $delete_code -eq 404 ]; then
    print_test "DELETE /countries/TestCountry" 0
else
    print_test "DELETE /countries/TestCountry" 1
fi

# Test 14: Case insensitivity test
print_header "14. Case Insensitivity"
make_request "GET" "/countries/nigeria" "Get country with lowercase name"
if [ $? -eq 200 ]; then
    print_test "GET /countries/nigeria (case insensitive)" 0
else
    print_test "GET /countries/nigeria (case insensitive)" 1
fi

# Test 15: Invalid endpoint (should return 404)
print_header "15. Invalid Endpoint"
make_request "GET" "/invalid-endpoint" "Test invalid endpoint"
if [ $? -eq 404 ]; then
    print_test "GET /invalid-endpoint (404 expected)" 0
else
    print_test "GET /invalid-endpoint (404 expected)" 1
fi

# Summary
print_header "Test Summary"
TOTAL=$((PASSED + FAILED))
echo -e "${GREEN}Passed:${NC} $PASSED / $TOTAL"
echo -e "${RED}Failed:${NC} $FAILED / $TOTAL"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     All tests passed! 🎉              ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"
    exit 0
else
    echo -e "\n${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║     Some tests failed ⚠️               ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}\n"
    exit 1
fi