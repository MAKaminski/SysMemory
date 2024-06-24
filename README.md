name: Update README with Traffic Info

on:
  schedule:
    - cron: '0 0 * * *'  # Runs daily at midnight
  push:  # Runs on every push to the repository
  workflow_dispatch:  # Allows manual triggering of the workflow

permissions:
  contents: write  # Grants write permission to contents

jobs:
  update-readme:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v2
        with:
          ref: main  # Ensure the main branch is checked out

      - name: Get Traffic Data
        id: traffic
        run: |
          echo "Fetching traffic data..."
          response=$(curl -H "Accept: application/vnd.github.v3+json" \
                       -H "Authorization: token ${{ secrets.GH_TOKEN }}" \
                       https://api.github.com/repos/${{ github.repository }}/traffic/views)
          echo "Raw Response: $response"  # Print the raw response for debugging
          views=$(echo $response | jq '.count')
          uniques=$(echo $response | jq '.uniques')
          echo "Parsed Views: $views"
          echo "Parsed Uniques: $uniques"
          echo "::set-output name=views::$views"
          echo "::set-output name=unique::$uniques"

      - name: Update README
        run: |
          VIEWS=${{ steps.traffic.outputs.views }}
          UNIQUES=${{ steps.traffic.outputs.unique }}
          DATE=$(date '+%Y-%m-%d')
          echo "Updating README.md..."
          # Store existing content without the Traffic Info section
          sed '/## Traffic Info/,/^\s*$/d' README.md > README.tmp
          # Insert new Traffic Info section at the top
          echo "## Traffic Info\nLast updated: $DATE\n\n* Total Views: $VIEWS\n* Unique Visitors: $UNIQUES\n\n" > README.md
          # Append the rest of the content
          cat README.tmp >> README.md

      - name: Commit and Push Changes
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
        run: |
          git config --global user.name 'github-actions'
          git config --global user.email 'github-actions@github.com'
          git remote set-url origin https://x-access-token:${{ secrets.GH_TOKEN }}@github.com/${{ github.repository }}.git
          git add README.md
          git commit -m "Update README with traffic info"
          git push origin HEAD:main